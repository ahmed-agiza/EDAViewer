package main

import (
	"bytes"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/ahmed-agiza/EDAViewer/server/goopendb"
	"github.com/apex/gateway"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"golang.org/x/crypto/bcrypt"
)

// ReponseMessage is a wrapper for the resulting file URL
type ReponseMessage struct {
	Download string
	Delete   string
}

// UploadedDesign models the parsing request payload
type UploadedDesign struct {
	Meta   []goopendb.DesignFile
	Files  []string
	Delete []string
}

// SigningResponseUpload models the upload field in the SigningResponse
type SigningResponseUpload struct {
	URL    string
	Fields map[string]string
}

// SigningResponse models the signed data for uploading to S3
type SigningResponse struct {
	Success  bool
	Message  string
	Download string
	Delete   string
	Upload   *SigningResponseUpload
}

// S3Object is a pair of bucket name and object key
type S3Object struct {
	Valid  bool
	Bucket string
	Key    string
}

// TemporaryDirectory is a temporary path to store uploaded files, empty string indicates the system's temproary directory
const TemporaryDirectory string = ""

// AWS Session
var awsSession *session.Session = nil

// AWS S3 Service
var s3Svc *s3.S3 = nil

// Uploads file to URL
func uploadFile(uploadURL string, params map[string]string, paramName string, contents []byte, filename string) (*http.Request, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	for key, val := range params {
		err := writer.WriteField(key, val)
		if err != nil {
			return nil, err
		}
	}
	part, err := writer.CreateFormFile(paramName, filename)
	if err != nil {
		return nil, err
	}
	part.Write(contents)
	err = writer.Close()
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", uploadURL, &body)
	if req != nil {
		req.Header.Add("Content-Type", writer.FormDataContentType())
	}
	return req, err
}

// Parse S3 download URL into bucket and key
func parseS3URL(s3URL string) (*S3Object, error) {
	parsedURL, err := url.Parse(s3URL)
	if err != nil {
		return nil, err
	}
	urlPath := parsedURL.Path
	for len(urlPath) > 0 && strings.HasPrefix(urlPath, "/") {
		urlPath = urlPath[1:]
	}
	host := parsedURL.Host
	hostParts := strings.Split(host, ".")
	bucket := hostParts[0]
	s3obj := &S3Object{
		Valid:  true,
		Bucket: bucket,
		Key:    urlPath,
	}
	return s3obj, nil
}

// Delete processed files from S3
func deleteFromS3(key string) error {
	uploadBucket := os.Getenv("S3_BUCKET")
	_, err := s3Svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(uploadBucket),
		Key:    aws.String(key),
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err.Error())
		return fmt.Errorf("Failed to parse the design")
	}
	return nil
}

// Generate random key to store the uploaded file
func generateKeyPrefix() string {
	randBytes := make([]byte, 4)
	rand.Read(randBytes)
	hash, err := bcrypt.GenerateFromPassword(randBytes, bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	hasher := md5.New()
	hasher.Write(hash)
	return hex.EncodeToString(hasher.Sum(nil))
}

// Signs S3 object download URL
func signS3Download(key string) (string, error) {
	expiry := 900
	if expiryStr, ok := os.LookupEnv("EXPIRY"); ok {
		expiry, _ = strconv.Atoi(expiryStr)
	}
	uploadBucket := os.Getenv("S3_BUCKET")
	req, _ := s3Svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(uploadBucket),
		Key:    aws.String(key),
	})
	urlStr, err := req.Presign(time.Duration(expiry) * time.Second)
	if err != nil {
		return "", err
	}
	return urlStr, nil
}

// Signs S3 object delete URL
func signS3Delete(key string) (string, error) {
	expiry := 900
	if expiryStr, ok := os.LookupEnv("EXPIRY"); ok {
		expiry, _ = strconv.Atoi(expiryStr)
	}
	uploadBucket := os.Getenv("S3_BUCKET")
	req, _ := s3Svc.DeleteObjectRequest(&s3.DeleteObjectInput{
		Bucket: aws.String(uploadBucket),
		Key:    aws.String(key),
	})
	urlStr, err := req.Presign(time.Duration(expiry) * time.Second)
	if err != nil {
		return "", err
	}
	return urlStr, nil
}

// Uploads file to S3
func uploadToS3(content []byte) (*SigningResponse, error) {
	uploadBucket := os.Getenv("S3_BUCKET")
	key := generateKeyPrefix() + "/design.json"
	uploader := s3manager.NewUploader(awsSession)
	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(uploadBucket),
		Key:    aws.String(key),
		Body:   bytes.NewReader(content),
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err.Error())
		return nil, fmt.Errorf("Failed to process the design")
	}
	downloadURL, err := signS3Download(key)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err.Error())
		return nil, fmt.Errorf("Failed to process the design")
	}
	deleteURL, err := signS3Delete(key)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err.Error())
		return nil, fmt.Errorf("Failed to process the design")
	}
	resp := &SigningResponse{
		Success:  true,
		Message:  "Parsed",
		Download: downloadURL,
		Delete:   deleteURL,
		Upload:   nil,
	}
	return resp, nil
}

// UploadHandler is a http.HandlerFunc for the / endpoint.
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if len(TemporaryDirectory) > 0 {
		os.Mkdir(TemporaryDirectory, 0600)
	} else {
		os.MkdirAll(os.TempDir(), 0600)
	}

	uploadedReq := &UploadedDesign{}
	json.NewDecoder(r.Body).Decode(uploadedReq)

	if len(uploadedReq.Files) == 0 {
		http.Error(w, "No files were uploaded", http.StatusBadRequest)
		return
	}
	if len(uploadedReq.Files) != len(uploadedReq.Meta) || len(uploadedReq.Files) != len(uploadedReq.Delete) {
		http.Error(w, "Each uploaded file should have one meta object", http.StatusBadRequest)
		return
	}

	uploadBucket := os.Getenv("S3_BUCKET")
	s3Objects := make([]*S3Object, 0)

	// Validate S3 URLs
	for i, downloadURL := range uploadedReq.Files {
		s3Obj, err := parseS3URL(downloadURL)
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err.Error())
			http.Error(w, "File error: "+uploadedReq.Meta[i].FileName, http.StatusBadRequest)
			return
		}
		s3Objects = append(s3Objects, s3Obj)
		if uploadBucket != s3Obj.Bucket {
			http.Error(w, "File error: "+uploadedReq.Meta[i].FileName, http.StatusBadRequest)
			return
		}
	}

	designFiles := &goopendb.DesignFiles{}

	for i, downloadURL := range uploadedReq.Files {
		fileMeta := uploadedReq.Meta[i]
		filename := strings.ToLower(fileMeta.FileName)
		if !strings.HasSuffix(filename, ".def") && !strings.HasSuffix(filename, ".lef") {
			http.Error(w, "Only design .lef and .def files are supported", http.StatusBadRequest)
			return
		}

		out, err := ioutil.TempFile(TemporaryDirectory, filename)

		defer out.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err.Error())
			http.Error(w, "Failed to handle the uploaded file: "+fileMeta.FileName, 503)
			return
		}
		defer os.Remove(out.Name())

		// Validate URL source
		// Download from S3
		downloadResp, err := http.Get(downloadURL)
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err.Error())
			http.Error(w, "Failed to handle the uploaded file: "+fileMeta.FileName, 503)
			return
		}
		defer downloadResp.Body.Close()
		if downloadResp.StatusCode != http.StatusOK {
			errBody, _ := ioutil.ReadAll(downloadResp.Body)
			fmt.Fprintf(os.Stderr, "%v\n", errBody)
			http.Error(w, "Failed to handle the uploaded file: "+fileMeta.FileName, 503)
			return
		}
		_, err = io.Copy(out, downloadResp.Body)

		// Delete downloaded files
		defer deleteFromS3(s3Objects[i].Key)

		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err.Error())
			http.Error(w, "Failed to handle the uploaded file: "+fileMeta.FileName, 503)
			return
		}

		fileMeta.FilePath = out.Name()
		if fileMeta.Type == "def" {
			if designFiles.DEF != nil {
				http.Error(w, "Only one DEF file per design is supported", http.StatusBadRequest)
				return
			}
			designFiles.DEF = &fileMeta
		} else if fileMeta.Type == "lef" {
			designFiles.LEF = append(designFiles.LEF, &fileMeta)
		} else {
			http.Error(w, "Invalid file type "+fileMeta.Type, http.StatusBadRequest)
			return
		}
	}
	design, err := goopendb.ParseDesignToJSON(designFiles, false)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Upload results to S3
	signData, err := uploadToS3(design)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err.Error())
		http.Error(w, "Failed to parse the design", 500)
		return
	}

	w.Header().Add("Accept-Charset", "utf-8")
	result := &ReponseMessage{Download: signData.Download, Delete: signData.Delete}
	json.NewEncoder(w).Encode(result)
}

// wrapHandler adds any common headers to the response
func wrapHandler(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")
		next.ServeHTTP(w, r)
	})
}

func main() {
	awsSession = session.Must(session.NewSession(&aws.Config{}))
	s3Svc = s3.New(awsSession)
	log.Fatal(gateway.ListenAndServe(":3000", wrapHandler(UploadHandler)))
}

package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ahmed-agiza/EDAViewer/server/goopendb"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/rs/cors"
)

// DesignSizeLimit is the maximum upload request size
const DesignSizeLimit int64 = 100 * 1024 * 1024 //200MB

// RequestMaxMemory is the maximum memory used to parse the multipart form
const RequestMaxMemory int64 = 2 * 1024 * 1024 //2MB

// TemporaryDirectory is a temporary path to store uploaded files, empty string indicates the system's temproary directory
const TemporaryDirectory string = ""

// HandleDesignUpload handles user uploaded design
func HandleDesignUpload(w http.ResponseWriter, r *http.Request) {
	if len(TemporaryDirectory) > 0 {
		os.Mkdir(TemporaryDirectory, 0600)
	} else {
		os.MkdirAll(os.TempDir(), 0600)
	}

	r.Body = http.MaxBytesReader(w, r.Body, DesignSizeLimit) // 100 Mb

	err := r.ParseMultipartForm(RequestMaxMemory)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v", err)
		http.Error(w, http.StatusText(413), 413)
		return
	}

	formdata := r.MultipartForm

	formMetas := formdata.Value["meta"]
	if len(formMetas) != 1 {
		http.Error(w, "Invalid or missing files information", http.StatusBadRequest)
		return
	}
	filesMeta := make([]goopendb.DesignFile, 0)
	err = json.Unmarshal([]byte(formdata.Value["meta"][0]), &filesMeta)
	if err != nil {
		http.Error(w, "Invalid or missing files information", http.StatusBadRequest)
		return
	}
	files := formdata.File["files"] // Grab design files
	if len(filesMeta) != len(files) {
		http.Error(w, "Each uploaded file should have one meta object", http.StatusBadRequest)
		return
	}

	designFiles := &goopendb.DesignFiles{}

	for i := range files {
		filename := strings.ToLower(files[i].Filename)
		if !strings.HasSuffix(filename, ".def") && !strings.HasSuffix(filename, ".lef") {
			http.Error(w, "Only design .lef and .def files are supported", http.StatusBadRequest)
			return
		}
		file, err := files[i].Open()
		defer file.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v", err)
			http.Error(w, "Failed to handle the uploaded file: "+files[i].Filename, 503)
			return
		}

		out, err := ioutil.TempFile(TemporaryDirectory, filename)

		defer out.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v", err)
			http.Error(w, "Failed to handle the uploaded file: "+files[i].Filename, 503)
			return
		}
		defer os.Remove(out.Name())

		_, err = io.Copy(out, file)

		if err != nil {
			fmt.Fprintf(os.Stderr, "%v", err)
			http.Error(w, "Failed to handle the uploaded file: "+files[i].Filename, 503)
			return
		}
		fileMeta := filesMeta[i]
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
	design, err := goopendb.ParseDesignToJSON(designFiles, true)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Add("Accept-Charset", "utf-8")
	w.Header().Add("Content-Type", "application/json")
	w.Header().Add("Content-Encoding", "gzip")
	w.Write(design)
}

// NewRouter returns the HTTP handler that implements the server login
func NewRouter() http.Handler {
	router := chi.NewRouter()

	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Compress(6, "gzip"))
	router.Use(middleware.Timeout(60 * time.Second))
	corsRules := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost",
			"http://edaviewer.com",
			"https://edaviewer.com",
			"http://defviewer.com",
			"https://defviewer.com",
			"http://www.edaviewer.com",
			"https://www.edaviewer.com",
			"http://api.edaviewer.com",
			"https://api.edaviewer.com",
		},
		AllowedMethods:   []string{"GET", "POST"},
		AllowCredentials: true,
	})
	router.Use(corsRules.Handler)

	router.Post("/", HandleDesignUpload)

	return router
}

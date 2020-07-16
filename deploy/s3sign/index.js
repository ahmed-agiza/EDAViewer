const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const sanitize = require("sanitize-filename");
const uuidv4 = require("uuid").v4;

const MaximumUploadSize = 100 * 1024 * 1024; //100MB

module.exports.handler = async (event) => {
	try {
		const filenameQuery = (
			(event["queryStringParameters"] || {})["filename"] || ""
		).trim();
		if (!filenameQuery) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					success: false,
					message: "Missing filename",
				}),
			};
		}
		const filename = sanitize(filenameQuery);
		const key = `${uuidv4()}/upload_${new Date().valueOf()}_${filename}`;
		const postData = await s3.createPresignedPost({
			Bucket: process.env.S3_BUCKET,
			Expires: process.env.EXPIRY || 900,
			Fields: {
				key,
			},
			Conditions: [
				["content-length-range", 0, MaximumUploadSize],
				{ "x-amz-storage-class": "STANDARD_IA" },
			],
		});
		const downloadURL = await s3.getSignedUrlPromise("getObject", {
			Bucket: process.env.S3_BUCKET,
			Key: key,
		});
		const deleteURL = await s3.getSignedUrlPromise("deleteObject", {
			Bucket: process.env.S3_BUCKET,
			Key: key,
		});
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "*",
				"Access-Control-Allow-Credentials": true,
			},
			body: JSON.stringify({
				success: true,
				message: "URL signed successfully.",
				upload: { ...postData },
				download: downloadURL,
				delete: deleteURL,
			}),
		};
	} catch (err) {
		console.error("Failed to sign S3 URL", err);
		return {
			statusCode: 502,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "*",
				"Access-Control-Allow-Credentials": true,
			},
			body: JSON.stringify({
				success: false,
				message: "Sign Error",
				err,
			}),
		};
	}
};

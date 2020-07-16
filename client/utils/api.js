import axios from "axios";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const uploadWithS3 = (uploadFiles) =>
	new Promise(async (resolve, reject) => {
		try {
			const meta = [];
			const del = [];
			const fileUrls = [];

			for (let i = 0; i < uploadFiles.files.length; i++) {
				try {
					const {
						data: { upload, download, delete: delURL },
					} = await axios.get(
						`${publicRuntimeConfig.s3SignURL}?filename=${uploadFiles.files[i].filename}`
					);
					const s3Form = new FormData();
					for (let field in upload.fields) {
						s3Form.append(field, upload.fields[field]);
					}
					s3Form.append(
						"x-amz-storage-class",
						publicRuntimeConfig.s3StorageClass
					);
					s3Form.append("file", uploadFiles.files[i].file);
					await axios.post(upload.url, s3Form, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					});
					meta.push({
						id: uploadFiles.files[i].id,
						type: uploadFiles.files[i].type,
						isLibrary: uploadFiles.files[i].isLibrary,
						filename: uploadFiles.files[i].filename,
						isTech: uploadFiles.techID == uploadFiles.files[i].id,
						index: i,
					});
					fileUrls.push(download);
					del.push(delURL);
				} catch (err) {
					return reject({
						response: {
							data: "Failed to upload design files",
							status: (err.response || {}).status || 500,
						},
					});
				}
			}
			const reqBody = {
				files: fileUrls,
				meta,
				delete: del,
			};
			const result = await axios.post(
				publicRuntimeConfig.uploadURL,
				reqBody,
				{
					headers: {
						"Content-Type": "applicaion/json",
					},
				}
			);
			const { data: design } = await axios.get(result.data.Download);
			setTimeout(async () => {
				await axios.delete(result.data.Delete);
			}, 0);
			return resolve(design);
		} catch (err) {
			return reject(err);
		}
	});

const uploadDirect = (uploadFiles) =>
	new Promise((resolve, reject) => {
		const uploadForm = new FormData();
		const meta = [];
		uploadFiles.files.forEach((file, index) => {
			uploadForm.append("files", file.file);
			meta.push({
				id: file.id,
				type: file.type,
				isLibrary: file.isLibrary,
				filename: file.filename,
				isTech: uploadFiles.techID == file.id,
				index,
			});
		});
		uploadForm.append("meta", JSON.stringify(meta));
		axios
			.post(publicRuntimeConfig.uploadURL, uploadForm, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then((result) => {
				resolve(result.data);
			})
			.catch((err) => {
				reject(err);
			});
	});

const upload = (uploadFiles) =>
	new Promise((resolve, reject) => {
		if (!publicRuntimeConfig.s3SignURL) {
			return uploadDirect(uploadFiles).then(resolve).catch(reject);
		} else {
			return uploadWithS3(uploadFiles).then(resolve).catch(reject);
		}
	});

export { upload, uploadDirect, uploadWithS3 };

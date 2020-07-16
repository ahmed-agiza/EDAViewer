const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");
const withCss = require("@zeit/next-css");
const withSass = require("@zeit/next-sass");
const webpack = require("webpack");
const path = require("path");
const nextBuildId = require("next-build-id");

module.exports = () => {
	const isServerless = !!process.env.NEXT_PUBLIC_EDAV_SERVERLESS;
	return withPlugins([[withCss], [withSass], [withImages]], {
		webpack(config, nextConfig) {
			config.resolve.modules.push(path.resolve("./"));
			return config;
		},
		generateBuildId: () => nextBuildId({ dir: __dirname }),
		target: isServerless ? "serverless" : "server",
		publicRuntimeConfig: {
			serverURL:
				process.env.NEXT_PUBLIC_EDAV_SERVER_URL ||
				"http://localhost:8080",
			uploadURL:
				process.env.NEXT_PUBLIC_EDAV_SERVER_URL ||
				"http://localhost:8080",
			analytics:
				(!process.env.NEXT_PUBLIC_EDAV_DISABLE_ANALYTICS ||
					process.env.NODE_ENV === "production") &&
				process.env.NEXT_PUBLIC_EDAV_ANALYTICS,
			s3SignURL: process.env.NEXT_PUBLIC_EDAV_S3_SIGN_URL
				? process.env.NEXT_PUBLIC_EDAV_S3_SIGN_URL
				: false,
			s3StorageClass: "STANDARD_IA",
			localStorageKey: "edavsettings",
		},
		env: {
			serverURL:
				process.env.NEXT_PUBLIC_EDAV_SERVER_URL ||
				"http://localhost:8080",
			analytics:
				(!process.env.NEXT_PUBLIC_EDAV_DISABLE_ANALYTICS ||
					process.env.NODE_ENV === "production") &&
				process.env.NEXT_PUBLIC_EDAV_ANALYTICS,
		},
	})(...arguments);
};

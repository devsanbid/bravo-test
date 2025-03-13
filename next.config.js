/** @type {import('next').NextConfig} */
const webpack = require("webpack");
const nextConfig = {
	webpack(config) {
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				/^isomorphic-form-data$/,
				`${config.context}/form-data-mock.js`,
			),
		);
		return config;
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: { unoptimized: true },
};

module.exports = nextConfig;

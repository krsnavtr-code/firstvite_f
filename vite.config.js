import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure assets are loaded from root
  server: {
    proxy: {
      "/api": {
        // target: 'https://firstvite-b.onrender.com',
        target: "http://localhost:4002",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url,
            );
          });
        },
      },
    },
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd", "@ant-design/compatible"],
          motion: ["framer-motion"],
          router: ["react-router-dom"],
          ui: ["react-hot-toast", "react-toastify"],
          icons: [
            "react-icons",
            "lucide-react",
            "@fortawesome/fontawesome-free",
          ],
          utils: ["axios", "dayjs", "date-fns", "lodash.debounce"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 4173, // Preview server port
  },
});

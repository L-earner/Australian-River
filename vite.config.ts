import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { handleApiRequest } from "./server/api"

function liveWaterApi(): Plugin {
  return {
    name: "live-water-api",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith("/api/")) {
          next()
          return
        }
        void handleApiRequest(request, response)
          .then((handled) => {
            if (!handled) next()
          })
          .catch(next)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [liveWaterApi(), inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

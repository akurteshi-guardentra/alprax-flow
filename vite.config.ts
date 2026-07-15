
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  // Determine base path based on deployment environment
  let base = '/';

  if (isProduction) {
    // Check if we're on GitHub Actions (GitHub Pages deployment)
    if (process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true') {
      base = '/alprax-flow/';
    }
    // For Lovable hosting and other platforms, use root path
    else {
      base = '/';
    }
  }

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
      mcpPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

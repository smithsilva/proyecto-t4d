module.exports = {
  apps: [
    {
      name: "tunel",
      script: "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe",
      args: "tunnel --url http://localhost:5000",
      interpreter: "none",
    },
  ],
};
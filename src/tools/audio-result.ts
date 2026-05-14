import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// 0.25-second 440 Hz beep, 8 kHz mono 8-bit PCM WAV — ~2 KB. Generated
// once offline and hardcoded so the server has no runtime audio deps.
const SAMPLE_WAV_BASE64 =
  "UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAosDW4uPYwqWDYUMsHh0nPFh6nLvT4eTax6uJZ0gvIBwkN1NzlrbP3+Tdy7CQbU0zIhwiM01tkLDL3eTfz7aWc1M3JBwgL0hniavH2uTh07ucelg8Jx0eLENhg6XC2OPi1sCigF5AKh4dKD5bfZ+91OLj2cSohmRFLR8cJjlVd5m40eDk3MmtjWpKMSEcIzVQcJOzzd7k3s2zk3BQNSMcITFKao2tydzk4NG4mXdVOSYcHy1FZIaoxNnj4tS9n31bPigdHipAXoCiwNbi49jCpYNhQyweHSc8WHqcu9Ph5NrHq4lnSC8gHCQ3U3OWts/f5N3LsJBtTTMiHCIzTW2QsMvd5N/PtpZzUzckHCAvSGeJq8fa5OHTu5x6WDwnHR4sQ2GDpcLY4+LWwKKAXkAqHh0oPlt9n73U4uPZxKiGZEUtHxwmOVV3mbjR4OTcya2NakoxIRwjNVBwk7PN3uTezbOTcFA1IxwhMUpqja3J3OTg0biZd1U5JhwfLUVkhqjE2ePi1L2ffVs+KB0eKkBegKLA1uLj2MKlg2FDLB4dJzxYepy70+Hk2seriWdILyAcJDdTc5a2z9/k3cuwkG1NMyIcIjNNbZCwy93k38+2lnNTNyQcIC9IZ4mrx9rk4dO7nHpYPCcdHixDYYOlwtjj4tbAooBeQCoeHSg+W32fvdTi49nEqIZkRS0fHCY5VXeZuNHg5NzJrY1qSjEhHCM1UHCTs83e5N7Ns5NwUDUjHCExSmqNrcnc5ODRuJl3VTkmHB8tRWSGqMTZ4+LUvZ99Wz4oHR4qQF6AosDW4uPYwqWDYUMsHh0nPFh6nLvT4eTax6uJZ0gvIBwkN1NzlrbP3+Tdy7CQbU0zIhwiM01tkLDL3eTfz7aWc1M3JBwgL0hniavH2uTh07ucelg8Jx0eLENhg6XC2OPi1sCigF5AKh4dKD5bfZ+91OLj2cSohmRFLR8cJjlVd5m40eDk3MmtjWpKMSEcIzVQcJOzzd7k3s2zk3BQNSMcITFKao2tydzk4NG4mXdVOSYcHy1FZIaoxNnj4tS9n31bPigdHipAXoCiwNbi49jCpYNhQyweHSc8WHqcu9Ph5NrHq4lnSC8gHCQ3U3OWts/f5N3LsJBtTTMiHCIzTW2QsMvd5N/PtpZzUzckHCAvSGeJq8fa5OHTu5x6WDwnHR4sQ2GDpcLY4+LWwKKAXkAqHh0oPlt9n73U4uPZxKiGZEUtHxwmOVV3mbjR4OTcya2NakoxIRwjNVBwk7PN3uTezbOTcFA1IxwhMUpqja3J3OTg0biZd1U5JhwfLUVkhqjE2ePi1L2ffVs+KB0eKkBegKLA1uLj2MKlg2FDLB4dJzxYepy70+Hk2seriWdILyAcJDdTc5a2z9/k3cuwkG1NMyIcIjNNbZCwy93k38+2lnNTNyQcIC9IZ4mrx9rk4dO7nHpYPCcdHixDYYOlwtjj4tbAooBeQCoeHSg+W32fvdTi49nEqIZkRS0fHCY5VXeZuNHg5NzJrY1qSjEhHCM1UHCTs83e5N7Ns5NwUDUjHCExSmqNrcnc5ODRuJl3VTkmHB8tRWSGqMTZ4+LUvZ99Wz4oHR4qQF6AosDW4uPYwqWDYUMsHh0nPFh6nLvT4eTax6uJZ0gvIBwkN1NzlrbP3+Tdy7CQbU0zIhwiM01tkLDL3eTfz7aWc1M3JBwgL0hniavH2uTh07ucelg8Jx0eLENhg6XC2OPi1sCigF5AKh4dKD5bfZ+91OLj2cSohmRFLR8cJjlVd5m40eDk3MmtjWpKMSEcIzVQcJOzzd7k3s2zk3BQNSMcITFKao2tydzk4NG4mXdVOSYcHy1FZIaoxNnj4tS9n31bPigdHipAXg==";

export function registerAudioResult(server: McpServer): void {
  server.registerTool(
    "audio_result",
    {
      title: "Audio Result",
      description:
        "Returns a short 440 Hz beep as `audio` content (WAV, base64). Use to verify the host renders an inline audio player for tool results.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "audio" as const,
          data: SAMPLE_WAV_BASE64,
          mimeType: "audio/wav",
        },
      ],
    }),
  );
}

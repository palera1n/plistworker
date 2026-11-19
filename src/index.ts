const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ENTITIES[character]);
}

function generatePlist(
  bundleid: string,
  name: string,
  version: string,
  fetchurl: string,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>${escapeXml(fetchurl)}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>${escapeXml(bundleid)}</string>
                <key>bundle-version</key>
                <string>${escapeXml(version)}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>${escapeXml(name)}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/genPlist") {
      return new Response("Not found", { status: 404 });
    }

    const bundleid = url.searchParams.get("bundleid");
    if (bundleid === null) {
      return new Response("Missing required query parameter: bundleid", {
        status: 400,
      });
    }

    const name = url.searchParams.get("name");
    if (name === null) {
      return new Response("Missing required query parameter: name", {
        status: 400,
      });
    }

    const version = url.searchParams.get("version");
    if (version === null) {
      return new Response("Missing required query parameter: version", {
        status: 400,
      });
    }

    const fetchurl = url.searchParams.get("fetchurl");
    if (fetchurl === null) {
      return new Response("Missing required query parameter: fetchurl", {
        status: 400,
      });
    }

    return new Response(generatePlist(bundleid, name, version, fetchurl), {
      headers: { "Content-Type": "application/octet-stream" },
    });
  },
};

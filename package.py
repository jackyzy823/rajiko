import json
import sys
import zipfile

ICON_LIST = [
    "Circle-icons-radio-blue-48.png",
    "Circle-icons-radio.png",
    "Circle-icons-radio-red-48.png",
    "Circle-icons-radio-red.svg",
    "Circle-icons-radio.svg",
]
FILE_LIST = [
    "manifest.json",
    "README.md",
    "LICENSE",
    "background.js",
    "_locales",
    "modules",
    "pages",
    "response",
    "ui",
] + ICON_LIST

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("python manifest.py <firefox|chrome>")
        sys.exit(-1)

    with open("manifest.jsonc.tmpl", "r") as m:
        MANIFEST_JSON = m.read()
    ## Support comments
    MANIFEST_JSON = "\n".join(
        l if not l.lstrip().startswith("//") else "" for l in MANIFEST_JSON.split("\n")
    )

    manifest = json.loads(MANIFEST_JSON)
    ## Do remove instead of add
    if sys.argv[1] == "firefox":
        platform = "firefox"
        del manifest["incognito"]
        del manifest["background"]["service_worker"]
        manifest["permissions"] = list(
            filter(lambda x: x != "offscreen", manifest["permissions"])
        )
    elif sys.argv[1] == "chrome":
        platform = "chrome"
        del manifest["background"]["scripts"]
        manifest["permissions"] = list(
            filter(
                lambda x: x not in ["webRequestBlocking", "webRequestFilterResponse"],
                manifest["permissions"],
            )
        )
    else:
        print("python manifest.py <firefox|chrome>")
        sys.exit(-1)

    ## dump if debug?
    with open("manifest.json", "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    version = manifest["version"]
    name = manifest["name"]

    zipfile.main(["-c", f"""{name}-{version}-{platform}.zip""", *FILE_LIST])

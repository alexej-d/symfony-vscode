import * as vscode from "vscode"
import * as fs from "graceful-fs"
import * as stripJsonComments from "strip-json-comments";

export class ComposerJSON {

    public initialize(): Promise<{symfonyVersion: number, uri: vscode.Uri}> {
        return new Promise((resolve, reject) => {
            if(vscode.workspace.workspaceFolders === undefined) {
                reject("No workspace folder opened")
            }
            vscode.workspace.findFiles("**/composer.lock").then(uris => {
                if(uris.length == 0) {
                    reject("No composer.lock file detected in the current workspace")
                } else {
                    uris.forEach(uri => {
                        let composerLockObj = JSON.parse(stripJsonComments(fs.readFileSync(uri.fsPath).toString()))
                        if(composerLockObj.packages !== undefined) {
                            composerLockObj.packages.forEach(({ name, version }) => {
                                if(name === "symfony/symfony" || name == "symfony/framework-bundle") {
                                    resolve({
                                        symfonyVersion: parseInt(version.match(/\d/)),
                                        uri: uri
                                    })
                                }
                            })
                        }
                    });
                    reject("No composer.json file wih Symfony as dependency detected")
                }
            })
        })
    }
}
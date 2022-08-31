import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('arma-addon-helper.generateXEHPrep', async () => {
        if (vscode.workspace.workspaceFolders === null || vscode.workspace.workspaceFolders?.length === 0) {
            return;
        };

        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const addonsDirectory = path.join(workspaceFolder, 'addons');
        if (!fs.existsSync(addonsDirectory)) {
            vscode.window.showErrorMessage('No \'addons\' directory found');
        };

        const addonDirectories: fs.Dirent[] = fs.readdirSync(addonsDirectory, { withFileTypes: true, }).filter((ent: fs.Dirent) => ent.isDirectory());
        if (addonDirectories.length === 0) {
            vscode.window.showWarningMessage('No addons found in the \'addons\' directory');
        }

        for (const directory of addonDirectories) {
            const addonDirectory = path.join(addonsDirectory, directory.name);

            const scripts = getAllFiles(addonDirectory)
                .map(f => path.parse(f))
                .filter(f => f.name.startsWith('fnc_'));

            if (scripts.length === 0) {
                vscode.window.showInformationMessage(`No functions found for addon '${directory.name}'`);
                continue;
            }

            vscode.window.showInformationMessage(`Writing XEH_PREP for addon '${directory.name}'`);

            const functions = scripts
                .map(file => file.name.slice(file.name.indexOf('_') + 1))
                .map(fnc => `PREP(${fnc});`);

            const prepFile = path.join(addonDirectory, 'XEH_PREP.hpp');
            fs.writeFileSync(prepFile, functions.join('\n').concat('\n'));
        }
    });

    context.subscriptions.push(disposable);
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach(function (file) {
        if (file.isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file.name), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file.name));
        }
    });

    return arrayOfFiles;
}

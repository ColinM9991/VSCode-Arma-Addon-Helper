import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('arma-addon-helper.generateXEHPrep', async () => {
        if (vscode.workspace.workspaceFolders === null || vscode.workspace.workspaceFolders?.length === 0) {
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const addonsDirectory = path.join(workspaceFolder, 'addons');
        if (!fs.existsSync(addonsDirectory)) {
            vscode.window.showErrorMessage('No \'addons\' directory found');
        }

        const addonDirectories: fs.Dirent[] = (await fsp.readdir(addonsDirectory, { withFileTypes: true, })).filter((ent: fs.Dirent) => ent.isDirectory());
        if (addonDirectories.length === 0) {
            vscode.window.showWarningMessage('No addons found in the \'addons\' directory');
        }

        for (const directory of addonDirectories) {
            const addonDirectory = path.join(addonsDirectory, directory.name);

            const allFiles = await getAllFiles(addonDirectory);
            if (allFiles.length === 0) {
                continue;
            }

            const scripts = allFiles
                .map(f => path.parse(f))
                .filter(f => f.ext === '.sqf' && f.name.startsWith('fnc_'));

            if (scripts.length === 0) {
                vscode.window.showInformationMessage(`No functions found for addon '${directory.name}'`);
                continue;
            }

            vscode.window.showInformationMessage(`Writing XEH_PREP for addon '${directory.name}'`);

            const functions = scripts
                .map(file => file.name.slice(file.name.indexOf('_') + 1))
                .map(fnc => `PREP(${fnc});`);

            const prepFile = path.join(addonDirectory, 'XEH_PREP.hpp');
            await fsp.writeFile(prepFile, functions.join('\n').concat('\n'));
        }
    });

    context.subscriptions.push(disposable);
}

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
    const files = await fsp.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            arrayOfFiles = await getAllFiles(path.join(dirPath, file.name), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file.name));
        }
    }

    return arrayOfFiles;
}

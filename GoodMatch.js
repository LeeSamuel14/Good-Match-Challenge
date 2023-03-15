"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class GoodMatch {
    constructor() {
        this.matchesWord = `matches`;
        this.highPercentage = 80;
        this.finalDigitCount = 2;
        this.maleSymbol = `m`;
        this.femaleSymbol = `f`;
        this.sentenceArray = new Array();
        this.lettersMap = new Map();
        this.csvFileContents = new Array();
        this.maleSet = new Set();
        this.femaleSet = new Set();
        this.matchesMap = new Map();
    }
    matchNames() {
        this.readCSVFile();
        this.createMaleAndFemaleSets();
        this.removeOutputFile();
        this.compareMaleAndFemaleSets();
        this.sortMatchedResults();
        this.writeResultsToTextFile();
        this.completedOperation();
    }
    readCSVFile() {
        if (process.argv.length < 3) {
            console.log('Please enter a filename as the last parameter!');
            process.exit(1);
        }
        const filename = process.argv[2];
        try {
            let fileContents = fs_1.default.readFileSync(filename, 'utf8').trim();
            fileContents = this.formatFileContent(fileContents);
            this.csvFileContents = fileContents.split(`,`);
        }
        catch (e) {
            console.log("File could not be read");
            process.exit(1);
        }
    }
    formatFileContent(fileContents) {
        if (fileContents.includes(`\r\n`)) {
            fileContents = fileContents.replaceAll(`\r\n`, `,`);
        }
        if (fileContents.includes(`\n`)) {
            fileContents = fileContents.replaceAll(`\n`, `,`);
        }
        if (fileContents.includes(`\r`)) {
            fileContents = fileContents.replaceAll(`\r`, `,`);
        }
        if (fileContents.includes(` `)) {
            fileContents = fileContents.replaceAll(` `, ``);
        }
        return fileContents;
    }
    createMaleAndFemaleSets() {
        let value = ``;
        for (let i = 0; i < this.csvFileContents.length; i++) {
            this.validateInput(this.csvFileContents[i]);
            value = this.csvFileContents[i];
            if (value == this.maleSymbol) {
                this.maleSet.add(this.csvFileContents[i - 1].trim());
            }
            if (value == this.femaleSymbol) {
                this.femaleSet.add(this.csvFileContents[i - 1].trim());
            }
        }
    }
    validateInput(value) {
        if (value.match(/^[0-9!@#\$%\^\&*\)\(+=._-]+$/g)) {
            console.log("No numbers or special characters allowed. Please check your CSV");
            process.exit(1);
        }
    }
    removeOutputFile() {
        try {
            fs_1.default.rmSync(`./output.txt`);
        }
        catch (error) {
        }
    }
    compareMaleAndFemaleSets() {
        for (const maleName of this.maleSet) {
            for (const femaleName of this.femaleSet) {
                const matchPercentage = this.getMatch(maleName, femaleName);
                const matchesNamesAndPercentage = this.getMatchSentenceWithPercentage(maleName, femaleName, matchPercentage);
                this.matchesMap.set(matchesNamesAndPercentage, matchPercentage);
            }
        }
    }
    writeResultsToTextFile() {
        for (const [key, value] of this.matchesMap) {
            try {
                fs_1.default.appendFileSync(`output.txt`, `${key} \n`);
            }
            catch (e) {
                console.log(`Could not write to output.txt file`);
                process.exit(1);
            }
        }
    }
    sortMatchedResults() {
        this.matchesMap = new Map([...this.matchesMap.entries()].sort());
        this.matchesMap = new Map([...this.matchesMap.entries()].sort((a, b) => b[1] - a[1]));
    }
    getMatch(name1, name2) {
        const sentence = `${name1}${this.matchesWord}${name2}`;
        this.sentenceArray = Array.from(sentence);
        this.createLettersMap();
        let numbersSentence = this.getInitialNumbersSentenceFromMap();
        while (numbersSentence.length > this.finalDigitCount) {
            numbersSentence = this.getNumbersSentence(numbersSentence);
        }
        const finalMatchPercentage = parseInt(numbersSentence);
        return finalMatchPercentage;
    }
    createLettersMap() {
        const map = new Map();
        for (let letter of this.sentenceArray) {
            letter = letter.toLowerCase();
            if (!map.has(letter)) {
                map.set(letter, 1);
            }
            else {
                const letterCount = map.get(letter);
                map.set(letter, letterCount + 1);
            }
        }
        this.lettersMap = map;
    }
    getInitialNumbersSentenceFromMap() {
        let numbersSentence = ``;
        for (const [key, value] of this.lettersMap) {
            numbersSentence += value;
        }
        return numbersSentence;
    }
    getNumbersSentence(numbers) {
        let numbersAdded = 0;
        let newNumbersSentence = ``;
        let numbersArray = Array.from(numbers);
        let endIndex = numbersArray.length - 1;
        for (let startIndex = 0; startIndex < numbersArray.length / 2; startIndex++) {
            if (startIndex === endIndex) {
                newNumbersSentence += numbersArray[startIndex];
                break;
            }
            numbersAdded = parseInt(numbersArray[startIndex]) + parseInt(numbersArray[endIndex]);
            newNumbersSentence += numbersAdded;
            endIndex--;
        }
        return newNumbersSentence;
    }
    getMatchSentenceWithPercentage(name1, name2, percentage) {
        let matchSentenceWithPercentage = ``;
        if (percentage >= this.highPercentage) {
            matchSentenceWithPercentage = `${name1} ${this.matchesWord} ${name2} ${percentage}%, good match`;
        }
        else {
            matchSentenceWithPercentage = `${name1} ${this.matchesWord} ${name2} ${percentage}%`;
        }
        return matchSentenceWithPercentage;
    }
    completedOperation() {
        console.log("Successfully made matches, please look for results in output.txt");
    }
}
const goodMatch = new GoodMatch();
goodMatch.matchNames();

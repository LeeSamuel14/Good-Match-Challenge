import fs from 'fs';

class GoodMatch {
    private matchesWord: string = `matches`;
    private highPercentage: number = 80;
    private finalDigitCount: number = 2;
    private maleSymbol: string = `m`;
    private femaleSymbol: string = `f`;

    private sentenceArray: Array<string> = new Array<string>();
    private lettersMap: Map<string, number> = new Map<string, number>();
    private csvFileContents: Array<string> = new Array<string>();
    private maleSet: Set<string> = new Set<string>();
    private femaleSet: Set<string> = new Set<string>();
    private matchesMap: Map<string, number> = new Map<string, number>();

    public matchNames(): void {
        this.readCSVFile();
        this.createMaleAndFemaleSets();
        this.removeOutputFile();
        this.compareMaleAndFemaleSets();
        this.sortMatchedResults();
        this.writeResultsToTextFile();
        this.completedOperation();
    }

    private readCSVFile(): void {
        if (process.argv.length < 3) {
            console.log('Please enter a filename as the last parameter!');
            process.exit(1);
        }

        const filename = process.argv[2];

        try {
            let fileContents = fs.readFileSync(filename, 'utf8').trim();
            
            fileContents = this.formatFileContent(fileContents);

            if(fileContents.trim() === ``){
                console.log("CSV file is empty. Please add a CSV file with data");
                process.exit(1);
            }

            this.csvFileContents = fileContents.split(`,`);
            
        }
        catch (e) {
            console.log("File could not be read");
            process.exit(1);
        }
    }

    private formatFileContent(fileContents: string) : string {
        if(fileContents.includes(`\r\n`)){
            fileContents = fileContents.replaceAll(`\r\n`, `,`);
        }
        if(fileContents.includes(`\n`)){
            fileContents = fileContents.replaceAll(`\n`, `,`);
        }
        if(fileContents.includes(`\r`)) {
            fileContents = fileContents.replaceAll(`\r`, `,`);
        }
        if(fileContents.includes(` `)) {
            fileContents = fileContents.replaceAll(` `, ``);
        }

        return fileContents;
    }

    private createMaleAndFemaleSets(): void {
        let value = ``;
        for (let i = 0; i < this.csvFileContents.length; i++) {
            this.validateInput(this.csvFileContents[i]);
            value = this.csvFileContents[i];
            if (value == this.maleSymbol) {
                this.maleSet.add(this.csvFileContents[i - 1].trim())
            }
            if (value == this.femaleSymbol) {
                this.femaleSet.add(this.csvFileContents[i - 1].trim())
            }
        }
    }

    private validateInput(value: string): void{
        if(value.match(/^[0-9!@#\$%\^\&*\)\(+=._-]+$/g)) {
            console.log("No numbers or special characters allowed. Please check your CSV");
            process.exit(1);
        }
    }

    private removeOutputFile() {
        try {
            fs.rmSync(`./output.txt`);
        } catch (error) {
        }
    }

    private compareMaleAndFemaleSets(): void {
        for (const maleName of this.maleSet) {
            for (const femaleName of this.femaleSet) {
                const matchPercentage = this.getMatch(maleName, femaleName);
                const matchesNamesAndPercentage = this.getMatchSentenceWithPercentage(maleName, femaleName, matchPercentage);
                this.matchesMap.set(matchesNamesAndPercentage, matchPercentage);
            }
        }
    }

    private writeResultsToTextFile(): void {
        
        for (const [key, value] of this.matchesMap) {
            try {
                fs.appendFileSync(`output.txt`, `${key} \n`);
            }
            catch (e) {
                console.log(`Could not write to output.txt file`);
                process.exit(1);
            }
        }
        
    }

    private sortMatchedResults(): void {
        this.matchesMap = new Map([...this.matchesMap.entries()].sort());
        this.matchesMap = new Map([...this.matchesMap.entries()].sort((a, b) => b[1] - a[1]));
    }

    private getMatch(name1: string, name2: string): number {

        const sentence = `${name1}${this.matchesWord}${name2}`;
        this.sentenceArray = Array.from(sentence);

        this.createLettersMap();

        let numbersSentence = this.getInitialNumbersSentenceFromMap();

        while (numbersSentence.length > this.finalDigitCount) {
            numbersSentence = this.getNumbersSentence(numbersSentence);
        }

        const finalMatchPercentage: number = parseInt(numbersSentence)
        
        return finalMatchPercentage;
    }

    private createLettersMap(): void {
        const map: Map<string, number> = new Map<string, number>();

        for (let letter of this.sentenceArray) {
            letter = letter.toLowerCase();

            if (!map.has(letter)) {
                map.set(letter, 1);
            }
            else {
                const letterCount = map.get(letter);
                map.set(letter, letterCount! + 1);
            }
        }

        this.lettersMap = map;
    }

    private getInitialNumbersSentenceFromMap(): string {
        let numbersSentence = ``;

        for (const [key, value] of this.lettersMap) {
            numbersSentence += value;
        }

        return numbersSentence;

    }

    private getNumbersSentence(numbers: string): string {
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

    private getMatchSentenceWithPercentage(name1: string, name2: string, percentage: number): string {
        
        let matchSentenceWithPercentage = ``;

        if(percentage >= this.highPercentage){
            matchSentenceWithPercentage = `${name1} ${this.matchesWord} ${name2} ${percentage}%, good match`
        }
        else{
            matchSentenceWithPercentage = `${name1} ${this.matchesWord} ${name2} ${percentage}%`
        }

        return matchSentenceWithPercentage;
    }

    private completedOperation() : void {
        console.log("Successfully made matches, please look for results in output.txt");
    }
    
}

const goodMatch: GoodMatch = new GoodMatch();
goodMatch.matchNames();
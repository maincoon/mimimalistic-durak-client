import * as fs from 'fs';
import * as path from 'path';
import {
    generateCardSVG,
    generateCardBackSVG,
    generateSuitIconSVG,
    generateTableBackgroundSVG,
    suits,
    ranks,
    type Suit,
    type Rank
} from './generate-cards';

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function generateAllAssets(outputDir: string): void {
    ensureDirectoryExists(outputDir);

    // Generate all cards
    for (const suit of suits) {
        for (const rank of ranks) {
            const svg = generateCardSVG({ rank, suit });
            // Use '10' in filename (Card.toString() outputs '10')
            const fileName = `${rank}${suit}.svg`;
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, svg);
            console.log(`Generated ${fileName}`);
        }
    }

    // Generate card back
    const backSvg = generateCardBackSVG();
    const backPath = path.join(outputDir, 'back.svg');
    fs.writeFileSync(backPath, backSvg);
    console.log('Generated back.svg');

    // Generate suit icons
    for (const suit of suits) {
        const svg = generateSuitIconSVG(suit);
        const fileName = `suit-${suit}.svg`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, svg);
        console.log(`Generated ${fileName}`);
    }

    // Generate table background
    const tableSvg = generateTableBackgroundSVG();
    const tablePath = path.join(outputDir, 'table-background.svg');
    fs.writeFileSync(tablePath, tableSvg);
    console.log('Generated table-background.svg');
}

// Main execution
const outputDir = path.resolve(process.cwd(), '../../apps/durak-client/public/cards');
console.log(`Generating assets to ${outputDir}`);
generateAllAssets(outputDir);
console.log('Asset generation complete!');
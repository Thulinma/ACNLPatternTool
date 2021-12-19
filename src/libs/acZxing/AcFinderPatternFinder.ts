import {
  BitMatrix,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library/esm';
import FinderPattern from "@zxing/library/esm/core/qrcode/detector/FinderPattern";
import FinderPatternInfo from "@zxing/library/esm/core/qrcode/detector/FinderPatternInfo";
import FinderPatternFinder from "@zxing/library/esm/core/qrcode/detector/FinderPatternFinder";
import ResultPoint from "@zxing/library/esm/core/ResultPoint";

// FIX THIS UP TO IMRPOVE SCANNING ACCURACY


/**
 * Patched FinderPatternFinder for multi-QR reading.
 */
class MyFinderPatternFinder extends FinderPatternFinder {

  public findMultiple(hints: Map<DecodeHintType, any>) /*throws NotFoundException */ {
    const tryHarder: boolean = (hints !== null && hints !== undefined) && undefined !== hints.get(DecodeHintType.TRY_HARDER);
    const pureBarcode: boolean = (hints !== null && hints !== undefined) && undefined !== hints.get(DecodeHintType.PURE_BARCODE);
    // @ts-ignore
    const image: BitMatrix = this.image;
    const maxI = image.getHeight();
    const maxJ = image.getWidth();
    // We are looking for black/white/black/white/black modules in
    // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far

    // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
    // image, and then account for the center being 3 modules in size. This gives the smallest
    // number of pixels the center could be, so skip this often. When trying harder, look for all
    // QR versions regardless of how dense they are.
    let iSkip = Math.floor((3 * maxI) / (4 * FinderPatternFinder.MAX_MODULES));
    if (iSkip < FinderPatternFinder.MIN_SKIP || tryHarder) {
      iSkip = FinderPatternFinder.MIN_SKIP;
    }

    let done: boolean = false;
    const stateCount = new Int32Array(5);
    for (let i = iSkip - 1; i < maxI && !done; i += iSkip) {
      // Get a row of black/white values
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;
      stateCount[3] = 0;
      stateCount[4] = 0;
      let currentState = 0;
      for (let j = 0; j < maxJ; j++) {
        if (image.get(j, i)) {
          // Black pixel
          if ((currentState & 1) === 1) { // Counting white pixels
            currentState++;
          }
          stateCount[currentState]++;
        } else { // White pixel
          if ((currentState & 1) === 0) { // Counting black pixels
            if (currentState === 4) { // A winner?
              if (FinderPatternFinder.foundPatternCross(stateCount)) { // Yes
                const confirmed: boolean = this.handlePossibleCenter(stateCount, i, j, pureBarcode);
                if (confirmed === true) {
                  // Start examining every other line. Checking each line turned out to be too
                  // expensive and didn't improve performance.
                  iSkip = 2;
                  // @ts-ignore
                  if (this.hasSkipped === true) {
                    // @ts-ignore
                    done = this.haveMultiplyConfirmedCenters();
                  } else {
                    // @ts-ignore
                    const rowSkip = <number>this.findRowSkip();
                    if (rowSkip > stateCount[2]) {
                      // Skip rows between row of lower confirmed center
                      // and top of presumed third confirmed center
                      // but back up a bit to get a full chance of detecting
                      // it, entire width of center of finder pattern

                      // Skip by rowSkip, but back off by stateCount[2] (size of last center
                      // of pattern we saw) to be conservative, and also back off by iSkip which
                      // is about to be re-added
                      i += rowSkip - stateCount[2] - iSkip;
                      j = maxJ - 1;
                    }
                  }
                } else {
                  stateCount[0] = stateCount[2];
                  stateCount[1] = stateCount[3];
                  stateCount[2] = stateCount[4];
                  stateCount[3] = 1;
                  stateCount[4] = 0;
                  currentState = 3;
                  continue;
                }
                // Clear state to start looking again
                currentState = 0;
                stateCount[0] = 0;
                stateCount[1] = 0;
                stateCount[2] = 0;
                stateCount[3] = 0;
                stateCount[4] = 0;
              } else { // No, shift counts back by two
                stateCount[0] = stateCount[2];
                stateCount[1] = stateCount[3];
                stateCount[2] = stateCount[4];
                stateCount[3] = 1;
                stateCount[4] = 0;
                currentState = 3;
              }
            } else {
              stateCount[++currentState]++;
            }
          } else { // Counting white pixels
            stateCount[currentState]++;
          }
        }
      }
      if (FinderPatternFinder.foundPatternCross(stateCount)) {
        const confirmed: boolean = this.handlePossibleCenter(stateCount, i, maxJ, pureBarcode);
        if (confirmed === true) {
          iSkip = stateCount[0];
          // @ts-ignore
          if (this.hasSkipped) {
            // Found a third one
            // @ts-ignore
            done = this.haveMultiplyConfirmedCenters();
          }
        }
      }
    }

    const patternInfos: Array<Array<FinderPattern>> = this.selectBestMultiplePatterns();
    patternInfos.forEach((patternInfo) => {
      ResultPoint.orderBestPatterns(patternInfo);
    });

    return patternInfos.map((patternInfo) => new FinderPatternInfo(patternInfo));
  }


  /**
   * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
   *         those that have been detected at least {@link #CENTER_QUORUM} times, and whose module
   *         size differs from the average among those patterns the least
   * @throws NotFoundException if 3 such finder patterns do not exist
   */
  public selectBestMultiplePatterns(): Array<Array<FinderPattern>> /*throws NotFoundException */ {

    // @ts-ignore
    const startSize = (<Array<FinderPattern>>this.possibleCenters).length;
    if (startSize < 3) {
      // Couldn't find enough finder patterns
      throw new NotFoundException();
    }

    // @ts-ignore
    const possibleCenters: Array<FinderPattern> = this.possibleCenters;
    let average: number;
    // Filter outlier possibilities whose module size is too different
    if (startSize > 3) {
      // But we can only afford to do so if we have at least 4 possibilities to choose from
      let totalModuleSize: number = 0.0;
      let square: number = 0.0;
      for (const center of possibleCenters) {
        const size: number = center.getEstimatedModuleSize();
        totalModuleSize += size;
        square += size * size;
      }
      average = totalModuleSize / startSize;
      let stdDev: number = <number>Math.sqrt(square / startSize - average * average);

      possibleCenters.sort(
        /**
         * <p>Orders by furthest from average</p>
         */
        // FurthestFromAverageComparator implements Comparator<FinderPattern>
        (center1: FinderPattern, center2: FinderPattern) => {
          const dA: number = Math.abs(center2.getEstimatedModuleSize() - average);
          const dB: number = Math.abs(center1.getEstimatedModuleSize() - average);
          return dA < dB ? -1 : dA > dB ? 1 : 0;
        });

      const limit: number = Math.max(0.2 * average, stdDev);

      for (let i = 0; i < possibleCenters.length && possibleCenters.length > 3; i++) {
        const pattern: FinderPattern = possibleCenters[i];
        if (Math.abs(pattern.getEstimatedModuleSize() - average) > limit) {
          possibleCenters.splice(i, 1);
          i--;
        }
      }
    }

    let unusedCenters = new Set(possibleCenters);
    let possibleCodes = [];
    if (unusedCenters.size > 3) {
      // group finders where h1xw1, h1xw2, h2xw1
      // TODO: currently does not account for top1 being a bottomleft corner
      unusedCenters.forEach(top1 => {
        let bottomLeft: FinderPattern;
        // remove from set so we dont compare it to itself
        unusedCenters.delete(top1);
        unusedCenters.forEach(top2 => {
          // are at the same height on image (possibe top corners)
          if (top1.getY() === top2.getY()) {
            // get horizontal distance between the two
            let Xdistance = top2.getX() - top1.getX();
            let Ydistance = Xdistance > 0 ? Xdistance + top1.getY() : Math.abs(Xdistance) + top2.getY();
            unusedCenters.forEach(bottom => {
              if (bottom.getX() === top1.getX() && bottom.getY() === Ydistance && !bottomLeft) {
                // found three corners of a square!
                bottomLeft = bottom;
                unusedCenters.delete(top2);
                unusedCenters.delete(bottom);
                // just print for now
                // console.log(`Corners found! ${top1}, ${top2}, ${bottom}`);
                possibleCodes.push([top1, top2, bottomLeft]);
                // break; no breaks in forEach or array destructuring in TS
              }
            })
          }
        })
      })
      // console.log(`Grouped codes: ${possibleCodes} 
      //                     & Unused corners: ${unusedCenters}`);

      // Throw away all but those first size candidate points we found.
      let totalModuleSize: number = 0.0;
      for (const possibleCenter of possibleCenters) {
        totalModuleSize += possibleCenter.getEstimatedModuleSize();
      }

      average = totalModuleSize / possibleCenters.length;

      possibleCenters.sort(
        /**
         * <p>Orders by {@link FinderPattern#getCount()}, descending.</p>
         */
        // CenterComparator implements Comparator<FinderPattern>
        (center1: FinderPattern, center2: FinderPattern) => {
          if (center2.getCount() === center1.getCount()) {
            const dA: number = Math.abs(center2.getEstimatedModuleSize() - average);
            const dB: number = Math.abs(center1.getEstimatedModuleSize() - average);
            return dA < dB ? 1 : dA > dB ? -1 : 0;
          } else {
            return center2.getCount() - center1.getCount();
          }
        });

      possibleCenters.splice(3); // this is not realy necessary as we only return first 3 anyway
    }

    if (possibleCodes.length > 1) return possibleCodes;

    return [[
      possibleCenters[0],
      possibleCenters[1],
      possibleCenters[2]
    ]];
  }
}

export default MyFinderPatternFinder;
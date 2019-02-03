import {Matrix} from './Matrix';

const MAX_TRIES = 99; // should mean that there is hard or impossible to create map with specified ships

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
}

export const BoardService = (function () {
  function BoardService() {

    function getRandomFreeField(shipLength, map) {
      const emptyFields = map.fields.filter((field) => !field.ship && !field.marked);

      if (emptyFields.length < shipLength) {
        throw new Error('Not enough empty fields');
      }
      const randomIndex = Math.floor(Math.random() * (emptyFields.length - 1));
      const field = emptyFields[randomIndex];

      field.marked = true;
      return field;
    }

    function calcBoundaries(field, shipLength, board) {
      // get Current Index (it changes when map is rotated)
      const start = board.fields.findIndex(f => f.x === field.x && f.y === field.y);
      const end = start + shipLength;

      // check if it's possible to create start and end
      if ((start % board.cols + shipLength > board.cols - 1) || (end >= board.cols * board.rows)) {
        throw new Error(`Out of boundary start: ${start} end: ${end}`);
      }
      const checkSum = (end + 1) % board.cols;

      if (checkSum > 0) {
        return {start, end: end + 1}; // add plus one field to check as it's not the edge of the board yet
      } else if (checkSum === 0) {
        return {start, end}; // end is at the edge
      }
      throw new Error('Out of boundary');
    }

    function isOccupied(row) {
      return row.filter(field => field.ship).length > 0;
    }

    function calcFieldsFor(shipLength, map) {
      let point = getRandomFreeField(shipLength, map);

      do {
        for (let i = 0; i < 4; i++) {
          try {
            const boundries = calcBoundaries(point, shipLength, map);
            const rowUpIndex = boundries.start - map.cols;
            const rowDownIndex = boundries.start + map.cols;
            const rowUp = rowUpIndex !== -1 ? map.fields.slice(rowUpIndex, boundries.end - map.cols + 1) : [];
            const rowDown = rowDownIndex !== -1 ? map.fields.slice(rowDownIndex, boundries.end + map.cols + 1) : [];
            const rowForShip = map.fields.slice(boundries.start, boundries.end + 1);

            if (isOccupied(rowForShip) || isOccupied(rowUp) || isOccupied(rowDown)) {
              throw new Error('Occupied field');
            }

            // Remove first as it's free area
            rowForShip.splice(0, 1);
            if ((boundries.start + shipLength + 1) % map.cols > 0) {
              // remove last as it's free area
              rowForShip.splice(-1, 1);
            }
            return rowForShip;
          } catch (e) {
            map.rotate90Degree();
          }
        }
        point = getRandomFreeField(shipLength, map);
      } while (point);

    }

    this.addShips = function (ships, map) {
      const sortedShips = ships.sort((a, b) => a.shipLength - b.shipLength);
      let newShipsFields = [], errors = 0;

      do {
        try {
          for (let shipI = sortedShips.length - 1; shipI > 0; shipI--) {
            let nextShipFields = [];

            nextShipFields = calcFieldsFor(ships[shipI].shipLength, map);
            nextShipFields.forEach(field => field.ship = {...ships[shipI], id: uuidv4()});
            newShipsFields.push(...nextShipFields);
          }
          break;
        } catch (error) {
          errors++;
          newShipsFields.forEach(field => {
            delete field.ship;
            delete field.marked;
          });
        }
      } while (errors < MAX_TRIES);
      if (errors === MAX_TRIES) {
        throw new Error(`Exceeded ${MAX_TRIES} tries`);
      }
      map.fields.forEach(f => delete f.marked);
    };

    this.initMap = function (cols, rows) {
      const fields = [];

      for (let rowI = 0; rowI < rows; rowI++) {
        for (let colI = 0; colI < cols; colI++) {
          fields.push({hit: false, x: colI, y: rowI});
        }
      }

      return new Matrix(cols, rows, fields);
    };
  }

  return BoardService;
})();

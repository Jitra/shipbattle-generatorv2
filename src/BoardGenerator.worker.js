import {BoardService} from './BoardService';

onmessage = function (e) {
  const {type, msgId, payload: {ships, width, height}} = e.data, payload = {}, boardService = new BoardService();
  let errors;

  try {
    switch (type) {
      case 'CREATE_MAP':
        payload.board = boardService.initMap(width, height);
        boardService.addShips(ships, payload.board);
        break;
    }
  } catch (e) {
    errors = e.toString();
  }

  self.postMessage({msgId, errors, payload});
};

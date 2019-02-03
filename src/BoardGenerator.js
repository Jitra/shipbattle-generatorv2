export const BoardGenerator = (function () {

  function BoardGenerator() {
    let counter = 0;
    const promiseRef = {};
    let worker;

    if (!worker) {
      worker = new Worker('./BoardGenerator.worker.js', {type: 'module'});
      worker.onmessage = function (msgEvent) {
        if (!msgEvent.data.errors) {
          promiseRef[msgEvent.data.msgId].resolve(msgEvent.data.payload.board.fields);
        } else {
          promiseRef[msgEvent.data.msgId].reject({message: 'Could not create map'});
        }
      };
    }

    function sendMessage(message) {
      let msgId = 'msg' + counter++;

      promiseRef[msgId] = {resolve: undefined, reject: undefined};
      message.msgId = msgId;
      worker.postMessage(message);

      return (new Promise((resolve, reject) => {
        promiseRef[msgId].resolve = resolve;
        promiseRef[msgId].reject = reject;
      }));
    }

    this.randomMap = function (width, height, ships) {
      const message = {type: 'CREATE_MAP', payload: {width, height, ships}};

      return sendMessage(message);
    };

    this.ship = function (name, shipLength) {
      return {name, shipLength};
    };
  }

  return BoardGenerator;
})();


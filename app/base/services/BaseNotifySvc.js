export default
class BaseNotifySvc {
  /*@ngInject*/
  constructor(toaster) {

    this.popSuccess = function() {
      toaster.pop('success', "title", "text");
    };
  }
}
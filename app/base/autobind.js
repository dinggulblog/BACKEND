import autoBind from 'auto-bind';

class AutoBindedClass {
  constructor(name) {
    this.name = name;
    autoBind(this);
  }
}

export default AutoBindedClass;
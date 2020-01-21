class App extends React.Component {
  constructor() {
    super();
    this._inputRef = React.createRef();
    this.state = {
      models: []
    };
  }

  render(){
    return (
      <div>
        <h1>0 to 60 stats</h1>
        <input placeholder='Search' className="form-control" type='text' ref={this._inputRef} onKeyUp={this._onKeyUp} />
        {this._results()}
      </div>
    );
  }

  _results() {
    return (
    <table className="table table-hover">
      <tr><th>Name</th><th>0-60</th><th>Quarter Mile</th></tr>
      {this.state.models.map(model => <tr><td>{model.name}</td><td>{model.zeroToSixty}</td><td>{model.quarterMile}</td></tr>)}
    </table>
    );
  }

  _onKeyUp = () => {
    if (this._inputRef.current.value.length >= 2) {
      this._processTimeout && clearTimeout(this._processTimeout);
      this._processTimeout = setTimeout(this._processInput, 100);
    }
  }

  _processInput = () => {
    if (this._inputRef.current.value.length < 2) {
      return;
    }
    this.setState({
      models: this._matchingModels(this._inputRef.current.value)
    });
  }

  _matchingModels = (matchString) => {
    if (!times) {
      return [];
    }
    
    const matchingModels = [];
    times.forEach(make => {
      make.models.forEach(model => {
        Object.entries(model.variants).forEach(([name, variant]) => {
          if (name.toLowerCase().indexOf(matchString.toLowerCase()) > -1) {
            matchingModels.push({ ...model.variants[name], name });
          }
        });
      });
    });
    return matchingModels;
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('container')
);
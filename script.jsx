const TRIMMED_COUNT = 50;

class App extends React.Component {
  constructor() {
    super();
    this._inputRef = React.createRef();
    this.state = {
      models: [],
      showMore: false,
      search: ''
    };
  }

  render(){
    return (
      <div>
        <h1>
          <svg className='icon' xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 16a3 3 0 0 1-3-3c0-1.12.61-2.1 1.5-2.61l9.71-5.62l-5.53 9.58c-.5.98-1.51 1.65-2.68 1.65m0-13c1.81 0 3.5.5 4.97 1.32l-2.1 1.21C14 5.19 13 5 12 5a8 8 0 0 0-8 8c0 2.21.89 4.21 2.34 5.65h.01c.39.39.39 1.02 0 1.41c-.39.39-1.03.39-1.42.01A9.969 9.969 0 0 1 2 13A10 10 0 0 1 12 3m10 10c0 2.76-1.12 5.26-2.93 7.07c-.39.38-1.02.38-1.41-.01a.996.996 0 0 1 0-1.41A7.95 7.95 0 0 0 20 13c0-1-.19-2-.54-2.9L20.67 8C21.5 9.5 22 11.18 22 13z" fill="white"/></svg>
          0 to 60
        </h1>
        <p>Find a cars 0-60 faster than it can get there.</p>
        <input placeholder='Search' className="form-control mb-2" type='text' ref={this._inputRef} onKeyUp={this._onKeyUp} />
        { this._navigationButtons() }
        { this._results() }
        { !this.state.showMore && this.state.models.length > TRIMMED_COUNT &&
          <button className='btn btn-primary' onClick={this._showMore}>Show More</button> }
        { this._navigateByMake() }
      </div>
    );
  }

  _navigationButtons() {
    const buttons = [];
    if (this.state.search === '') {
      if (this.state.make) {
        buttons.push(<button key='clearMake' className='btn btn-secondary' onClick={this._clearMake}>Return to Make List</button>);
      }
      if (this.state.model) {
        buttons.push(<button key='clearModel' className='btn btn-secondary ml-2' onClick={this._clearModel}>Return to Model List</button>);
      }
    } else {
      buttons.push(<button key='clearModel' className='btn btn-secondary' onClick={this._clearSearch}>Clear Search</button>);
    }
    return buttons.length > 0 && <div className='mb-2'>{buttons}</div>
  }

  _results() {
    return this.state.models.length > 0 && (
      <table className="table table-hover">
        <tr><th>Name</th><th>0-60</th><th>Quarter Mile</th></tr>
        {(this.state.showMore ? this.state.models : this.state.models.slice(0, TRIMMED_COUNT)).map(this._displayModel)}
      </table>
    );
  }

  _navigateByMake() {
    if (!this._shouldShowNavigateByMake()) {
      return;
    }
    if (this.state.make) {
      return this._modelList();
    }
    return this._makeList();
  }

  _modelList() {
    return (
      <div>
        { this.state.make.models.map(model => <div onClick={this._onClickModel.bind(this, model)} className='inlineBrand'><button className='btn btn-link'>{model.name}</button></div>)}
      </div>
    );
  }

  _makeList() {
    return (
      <div>
        { times.map(make => <div onClick={this._onClickMake.bind(this, make)} className='inlineBrand'><img className='brandIcon' src={make.brandIcon} /><button className='btn btn-link'>{make.name}</button></div>)}
      </div>
    );
  }

  _shouldShowNavigateByMake() {
    return this.state.models.length === 0 && (!this._inputRef.current || this._inputRef.current.value === '');
  }

  _displayModel(model) {
    return <tr><td>{model.name}</td><td>{model.zeroToSixty}</td><td>{model.quarterMile}</td></tr>;
  }

  _onKeyUp = () => {
    if (this._inputRef.current.value.length >= 2) {
      this._processTimeout && clearTimeout(this._processTimeout);
      this._processTimeout = setTimeout(this._processInput, 100);
    } else if (this._inputRef.current.value === '') {
      this.setState({
        models: [],
        search: ''
      });
    }
  }

  _showMore = () => {
    this.setState({
      showMore: true
    });
  }

  _onClickMake = (make) => {
    this.setState({
      make: make
    });
  }

  _clearMake = () => {
    this.setState({
      make: undefined,
      model: undefined,
      models: []
    });
  }

  _onClickModel = (model) => {
    this.setState({
      model: model,
      models: Object.entries(model.variants).map(([name, object]) => ({ name: name, ...object }))
    });
  }

  _clearModel = () => {
    this.setState({
      model: undefined,
      models: []
    });
  }

  _clearSearch = () => {
    this._inputRef.current.value = '';
    this.setState({
      search: '',
      models: [],
      make: undefined,
      model: undefined
    });
  }

  _processInput = () => {
    if (this._inputRef.current.value.length < 2) {
      return;
    }
    this.setState({
      models: this._matchingModels(this._inputRef.current.value),
      showMore: false,
      search: this._inputRef.current.value
    });
  }

  _matchingModels = (matchString) => {
    if (!times) {
      return [];
    }

    let search = matchString.toLowerCase();
    const splits = search.split(' ');
    // add a space prefix to ensure the string maps at the start of a word
    // only case this doesn't nicely handle is the years at the start of the name
    for (let x = 1; x < splits.length; x++) {
      splits[x] = ' ' + splits[x];
    }
    return times_lookup.filter(item =>
      splits.every(split => item.key.indexOf(split) > -1)
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
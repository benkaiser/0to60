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
        <h1>0 to 60 Browser</h1>
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
    const searchPermutations = this._permutate(search);
    return times_lookup.filter(item =>
      searchPermutations.some(permutation => item.key.indexOf(permutation) > -1)
    );
  }

  _permutate(search) {
    const permutations = [];
    const splits = search.split(' ');
    for (let x = 0; x < splits.length; x++) {
      const firstItem = splits.shift();
      splits.push(firstItem);
      permutations.push(splits.join(' '));
    }
    return permutations;
  }
}
debugger;


ReactDOM.render(
  <App />,
  document.getElementById('container')
);
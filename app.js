//Created By: WillowTree Apps
//Updated By: Wesley Thompson 
 
 
 /*==================================================

           API

         ***************************************************/

        /**
         * Get the data from the namegame endpoint.
         *
         * The data comes back in the format:
         *
         *    [
         *        { firstName: 'Viju,  lastName: 'Legard',  headshot: { url: '...' } },
         *        { firstName: 'Matt', lastName: 'Seibert', headshot: { url: '...' } },
         *        ...
         *    ]
         */
        function getPersonList() {
            return new Promise((resolve, reject) => {
                fetch('https://willowtreeapps.com/api/v1.0/profiles')
                .then(response => {
                    if (response.status !== 200) {
                        reject(new Error("Error!"));
                    }

                    response.json().then(imageList => {
                        resolve(imageList);
                    });
                });
            });
        }


        /*==================================================

           DATA TRANSFORMS

         ***************************************************/


        function getLastName(person) {
            return person.lastName;
        }

        function getFirstName(person){
            return person.firstName;
        };

        function getJobTitle(person){
            return person.jobTitle;
        };

        // headshot URLs are scheme relative //
        // prepend http: to prevent invalid schemes like file:// or uri://
        function getImageUrl(person){
            let imageToReturn = person.headshot.url;
            if(typeof(imageToReturn) == 'undefined'){
                return 'images/blank_profile.png' 
            }else{
                return `http:${imageToReturn}`;
            }
            
        };

        //Function that takes in a string/length and returns a substring of the input length 
        function getNameSubString(length,name){
            let curName = "";
            for(let i = 0; i < length;i++){
                curName+=name[i];
            }
            return curName;
        }

        /**
         * Fisher-Yates shuffle
         */
        function shuffleList(list) {
            // Make a copy & don't mutate the passed in list
            let result = list.slice(1);

            let tmp, j, i = list.length - 1

            for (; i > 0; i -= 1) {
                j = Math.floor(Math.random() * (i + 1));
                tmp = list[i];
                list[i] = list[j];
                list[j] = tmp;
            }

            return result;
        }


        /**
         * Remove any people that do not have the name we are
         * searching for.
         */
        function filterByName(searchForName, personList) {
            return personList.filter((person) => {
                let fullName = person.firstName + " " + person.lastName;
                return getNameSubString(searchForName.length,fullName.toLowerCase()) === searchForName.toLowerCase() ||
                getNameSubString(searchForName.length,person.firstName.toLowerCase()) === searchForName.toLowerCase() ||
                getNameSubString(searchForName.length,person.lastName.toLowerCase()) === searchForName.toLowerCase()
            });
        }

        


        /**
         * Takes in a property of an object list, e.g. "name" below
         *
         *    people = [{ name: 'Sam' }, { name: 'Jon' }, { name: 'Kevin' }]
         *
         * And returns a function that will sort that list, e.g.
         *
         *    const sortPeopleByName = sortObjListByProp('name');
         *    const sortedPeople = sortPeopleByName(people);
         *
         *  We now have:
         *
         *    console.log(sortedPeople)
         *    > [{ name: 'Jon' }, { name: 'Kevin' }, { name: 'Sam' }]
         *
         */
        function sortObjListByProp(prop) {
            return function(objList) {
                // Make a copy & don't mutate the passed in list
                let result = objList.slice(1);
                
                result.sort((a, b) => {
                    console.log(a[prop]);
                    if (a[prop] < b[prop]) {
                        return -1;
                    }

                    if (a[prop] > b[prop]) {
                        return 1;
                    }
                    if (typeof(a[prop]) == 'undefined' && typeof(b[prop]) !== 'undefined'){
                        return 1;
                    }
                    if (typeof(a[prop]) !== 'undefined' && typeof(b[prop]) == 'undefined'){
                        return -1;
                    }

                    return 1;
                });
                
                
                return result;
            };
        }

        const sortByFirstName = sortObjListByProp('firstName');

        const sortByLastName = sortObjListByProp('lastName');

        const sortByJob = sortObjListByProp('jobTitle');

        var searchStyle = {
            margin: "0 0 0 35%",
          };


        /*==================================================

           VIEW (React)

         ***************************************************/

        const Search = (props) => React.DOM.input({
            type: 'input',
            onChange: props.onChange,
            style: searchStyle
        });

        const Thumbnail = (props) => React.DOM.img({
            className: 'image',
            src: props.src
        });

        const ListRow = (props) => React.DOM.tr({ key: `${props.person.firstName} ${props.person.lastName}`, className:"list-row" }, [
            React.DOM.td({ key: 'thumb' }, React.createElement(Thumbnail, { src: getImageUrl(props.person) })),
            React.DOM.td({ key: 'first' }, null, getFirstName(props.person)),
            React.DOM.td({ key: 'last' }, null, getLastName(props.person)),
            React.DOM.td({ key: 'job' }, null, getJobTitle(props.person)),
        ]);

        const ListContainer = (props) => React.DOM.table({ className: 'list-container' }, [
            React.DOM.thead({ key: 'thead' }, React.DOM.tr({}, [
                React.DOM.th({ key: 'thumb-h' }, null, 'Thumbnail'),
                React.DOM.th({ key: 'first-h' }, null, 'First Name'),
                React.DOM.th({ key: 'last-h' }, null, 'Last Name'),
                React.DOM.th({ key: 'job-h' }, null, 'Job Title')
            ])),
            React.DOM.tbody({ key: 'tbody' }, props.personList.map((person, i) =>
                React.createElement(ListRow, { key: `person-${i}`, person })))
        ]);

        const App = React.createClass({
            getInitialState() {
                return {
                    personList: [],
                    visiblePersonList: []
                };
            },

            componentDidMount() {
                getPersonList().then((personList) =>
                    this.setState({
                        personList,
                        visiblePersonList: personList
                    }));
            },

            _shuffleList() {
                this.setState({
                    visiblePersonList: shuffleList(this.state.personList)
                });
            },

            _sortByFirst() {
                this.setState({
                    visiblePersonList: sortByFirstName(this.state.personList)
                });
            },

            _sortByLast() {
                this.setState({
                    visiblePersonList: sortByLastName(this.state.personList)
                });
            },

            _sortByJob() {
                this.setState({
                    visiblePersonList: sortByJob(this.state.personList)
                });
            },

            _onSearch(e) {
                this.setState({
                    visiblePersonList: filterByName(e.target.value, this.state.personList)
                });
            },

            render() {
                const { visiblePersonList } = this.state;
                Search.id = 'search-bar';

                return React.DOM.div({ className: 'app-container' }, [
                    React.DOM.button({ key: 'shuffle', onClick: this._shuffleList }, null, 'Shuffle'),
                    React.DOM.button({ key: 'sort-first', onClick: this._sortByFirst }, null, 'Sort (First Name)'),
                    React.DOM.button({ key: 'sort-last', onClick: this._sortByLast }, null, 'Sort (Last Name)'),
                    React.DOM.button({ key: 'sort-job', onClick: this._sortByJob }, null, 'Sort (Job)'),
                    React.createElement(Search, { key: 'search', onChange: this._onSearch}),
                    React.createElement(ListContainer, { key: 'list', personList: visiblePersonList })
                ]);
            }
        });

        ReactDOM.render(
            React.createElement(App),
            document.getElementById('app')
        );
import './App.css';
import {Grid} from "@material-ui/core";
import {LineGraph} from "./components/Chart";
import {useState} from "react";

const App = () => {
    const [input, setInput] = useState('')
    return (
        <div className="App">
            <Grid container>
                <Grid md={1}></Grid>
                <Grid container md={10}>
                    <Grid item md={12}>
                        <h1 style={{textAlign: 'left'}}>cryptoMaven</h1>
                    </Grid>
                    <Grid item md={12}>
                        <form onSubmit={ e => e.preventDefault()} style={{textAlign: 'left', marginBottom: '20px'}}>
                            <input value={input} onChange={(e) => { setInput(e.target.value) }} type="text"/>
                            <button type="submit"> > </button>
                        </form>
                    </Grid>
                    <Grid item md={12}>
                        <LineGraph coinName={input ? input : 'BTC'}/>
                    </Grid>
                </Grid>

                <Grid md={1}></Grid>
            </Grid>
        </div>
    );
}

export default App;

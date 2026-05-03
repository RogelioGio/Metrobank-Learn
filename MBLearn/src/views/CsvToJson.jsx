import { useState } from "react";
import Papa from 'papaparse';
import axiosClient from "../axios-client";

function CsvToJson(){
    const [csvData, setCsvData] = useState([]);
    const [jsonData, setJsonData] = useState([]);
    const csvUploadFn = (event) => {
        const file = event.target.files[0];
        const fileType = file.name.split('.').pop().toLowerCase();
        if(fileType !== 'csv'){
            alert('Please upload a CSV File');
            return;
        }
        Papa.parse(file, {
            skipEmptyLines: "greedy",
            complete: (result) => {
                setCsvData(result.data);
            },
            header: true,
        });
    };
    const conversionFn = () => {
        const res = JSON.stringify(csvData, null, 2);
        setJsonData(res);
    };

    const submitJson = () =>{
        console.log(csvData);
        axiosClient.post('/add-many-users', csvData)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }

    return(
        <div className="container">
            <div className="header">
                <h1>CSV To JSON Converter</h1>
                <input type="file" 
                onChange={csvUploadFn}
                accept=".csv"/>
                <button className="button" onClick={conversionFn}>Convert To JSON</button>
                <button className="button" onClick={submitJson}>Add Users</button>
            </div>
            <div className="content">
                {csvData.length > 0 && (
                    <div className="data-container">
                        <h2>CSV Data</h2>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(csvData[0]).map(
                                        (header,index)=>(
                                            <th key={index}>{header}</th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.map((row,rowIndex)=>(
                                    <tr key={rowIndex}>
                                        {Object.values(row).map(
                                            (cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            )
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {jsonData && (
                    <div className="data-container">
                        <h2>JSON Data</h2>
                        <pre>{jsonData}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}
export default CsvToJson;
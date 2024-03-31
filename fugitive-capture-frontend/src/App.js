// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from "./config.js"

function App() {
  const [cities, setCities] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [copChoices, setCopChoices] = useState({}); // State to store cop choices
  const [captureStatus, setCaptureStatus] = useState([]); // State to store cop choices

  useEffect(() => {
    // Fetch cities data from backend
    console.log(`${config.baseUrl}/api/vehicles`)
    axios.get(`${config.baseUrl}/api/cities`)
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error('Error fetching cities:', error);
      });
    // Fetch vehicles data from backend
    axios.get(`${config.baseUrl}/api/vehicles`)
      .then(response => {
        setVehicles(response.data);
      })
      .catch(error => {
        console.error('Error fetching vehicles:', error);
      });
  }, []);

  const handleCitySelect = (copId, selectedCity) => {
    Object.entries(copChoices).forEach(([key, entry]) => {
      if(selectedCity == entry.selectedCity){
        alert(`${selectedCity} is selected already.`);
        return ;
      }
    })
    setCopChoices(prevChoices => ({
      ...prevChoices,
      [copId]: { ...prevChoices[copId], selectedCity }
    }));
  };

  const handleVehicleSelect = (copId, selectedVehicle) => {
    setCopChoices(prevChoices => ({
      ...prevChoices,
      [copId]: { ...prevChoices[copId], selectedVehicle }
    }));
  };

  const handleCapture = () => {
    // Send cop choices to backend
    let go=true;
    Object.entries(copChoices).forEach(([key, entry]) => {
      if(!entry?.selectedCity){
        alert(`City is not selected for cop ${+key+1}`);
        go=false;
      }
      if(!entry?.selectedVehicle){
        alert(`Vehicle is not selected for cop ${+key+1}`);
        go=false;
      }
    })
    if(go)
    axios.post(`${config.baseUrl}/api/capture`, copChoices)
      .then(response => {
         let {data}=response;
         setCaptureStatus(data);
      })
      .catch(error => {
        console.error('Error capturing fugitive:', error);
      });
  };

  return (
    <div className="App">
      <h1>Cop Capture Game</h1>
      {/* Render dropdowns for each cop */}
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index}>
          <h2>Cop {index + 1}</h2>
          <label>Select City:</label>
          <select onChange={(e) => handleCitySelect(index, e.target.value)} >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
          <br />
          <label>Select Vehicle:</label>
          <select onChange={(e) => handleVehicleSelect(index, e.target.value)}>
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.kind} value={vehicle.kind}>{vehicle.kind}</option>
            ))}
          </select>
        </div>
      ))}
      <br />
      <button onClick={handleCapture}>Capture Fugitive</button>
      {captureStatus.length > 0 && (
        <table  className="capture-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Capturing Cop</th>
              <th>Selected City</th>
              <th>Selected Vehicle</th>
              <th>City Distance</th>
              <th>Vehicle Range</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {captureStatus.map((status, index) => (
              <tr key={index}>
                <td style={{textAlign:"center"}}>{status.status ? 'Success' : 'Failure'}</td>
                <td style={{textAlign:"center"}}>{status.capturingCop}</td>
                <td style={{textAlign:"center"}}>{status.selectedCity}</td>
                <td style={{textAlign:"center"}}>{status.selectedVehicle}</td>
                <td style={{textAlign:"center"}}>{status.distance}</td>
                <td style={{textAlign:"center"}}>{status.range}</td>
                
                <td style={{textAlign:"center"}}>{status.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

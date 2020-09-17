import React from 'react';

const weatherForcastGroup = (results) => {

    return (
    <ul className={'itemGroup'}>
        {results.map((result, i) => (
        <li key={i}>
            <div>{result.dow}: {result.day?.temp}c - UV: {result.day?.uv_index}</div>
            <div>Sunrise: {result.sunrise} Sunset: {result.sunset}</div>
            <div>{result.narrative}</div>
            </li>))}
    </ul>);
}

export default weatherForcastGroup;
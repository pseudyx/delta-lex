import React from 'react';

const weatherForcastGroup = (results) => {

    return (
    <ul className={'itemGroup'}>
        {results.map((result, i) => (
        <li key={i}>
            
            </li>))}
    </ul>);
}

export default weatherForcastGroup;
import React from 'react';

const listItemGroup = (results) => {

    return (
    <ul className={'itemGroup'}>
        {results.map((result, i) => (
        <li key={i}>
            <span><a href={result.link} style={{color:'#ccc'}} target="_blank" rel="noopener noreferrer">{result.title}</a></span>
            <span>{result.description}</span>
            </li>))}
    </ul>);
}

export default listItemGroup;
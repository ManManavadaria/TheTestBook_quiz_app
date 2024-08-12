import React from 'react';

const TestCard = ({ testName, score }) => {
    return (
        <div style={styles.card}>
            <h3>{testName}</h3>
            <p>Score: {score}</p>
        </div>
    );
};

const styles = {
    card: {
        border: '1px solid #ddd',
        padding: '10px',
        margin: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }
};

export default TestCard;

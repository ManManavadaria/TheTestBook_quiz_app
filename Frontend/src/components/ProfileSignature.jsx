import React from 'react';

const ProfileSignature = ({ name }) => {
    const getInitials = (name) => {
        return name.split(' ').map((word) => word[0].toUpperCase()).join('');
    };

    const initials = getInitials(name);

    return (
        <div style={styles.signatureCircle}>
            {initials}
        </div>
    );
};

const styles = {
    signatureCircle: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',    
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        margin: 'auto'
    }
};

export default ProfileSignature;

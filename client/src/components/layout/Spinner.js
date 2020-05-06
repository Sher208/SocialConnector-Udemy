import React, { Fragment } from 'react';
import spinner_gif from './spinner.gif';

const Spinner = () => {
  return (
    <Fragment>
      <img
        src={spinner_gif}
        style={{ width: '200px', margin: 'auto', display: 'block' }}
        alt='Loading...'
      />
    </Fragment>
  );
};

export default Spinner;

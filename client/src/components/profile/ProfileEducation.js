import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

const ProfileEducation = ({
  education: { school, degree, fieldofstudy, from, to, current, description },
}) => {
  return (
    <Fragment>
      <hr />
      <h3 className='text-dark'>{school}</h3>
      <p>
        <Moment format='YYYY/MM/DD'>{from}</Moment>-
        {to === null ? (
          'Now'
        ) : (
          <Fragment>
            <Moment format='YYYY/MM/DD'>{to}</Moment>
          </Fragment>
        )}
      </p>
      <p>
        <strong>Field Of Study: </strong>
        {fieldofstudy}
      </p>
      <p>
        <strong>Degree: </strong>
        {degree}
      </p>
      <p>
        <strong>Description: </strong>
        {description}
      </p>
    </Fragment>
  );
};

ProfileEducation.propTypes = {
  exxperince: PropTypes.object.isRequired,
};

export default ProfileEducation;

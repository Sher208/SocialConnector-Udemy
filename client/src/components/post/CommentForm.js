import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { commentAdded } from '../../actions/post';

const CommentForm = ({ postId, commentAdded }) => {
  const [text, changeComment] = useState('');
  return (
    <div className='post-form'>
      <div className='bg-primary p'>
        <h3>Comment Here</h3>
      </div>
      <form
        className='form my-1'
        onSubmit={(e) => {
          e.preventDefault();
          commentAdded(postId, { text });
          changeComment('');
        }}
      >
        <textarea
          name='text'
          cols='30'
          rows='5'
          placeholder='Create a post'
          value={text}
          onChange={(e) => changeComment(e.target.value)}
          required
        ></textarea>
        <input type='submit' className='btn btn-dark my-1' value='Submit' />
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  commentAdded: PropTypes.func.isRequired,
};

export default connect(null, { commentAdded })(CommentForm);

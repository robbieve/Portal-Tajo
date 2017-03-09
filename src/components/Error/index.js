import React from 'react';
import { translate } from 'utils/i18n';

import styles from './styles.css';
import phrases, { phrasesShape } from './PropTypes';

const Error = ({
  type,
  translations,
}) => (
  <div className={styles.error}>
    { translations[type] }
  </div>
);

Error.propTypes = {
  type: React.PropTypes.string.isRequired,

  translations: phrasesShape.isRequired,
};

Error.defaultProps = {
  translations: phrases,
};

export default translate()(Error);

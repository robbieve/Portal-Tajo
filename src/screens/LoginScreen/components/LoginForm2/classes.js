import { StyleSheet } from 'aphrodite/no-important';
import theme from 'configs/theme';

export const size = 100;

export default StyleSheet.create({
  wrapper: {
    width: 400,
    position: 'relative',
    marginTop: 150,
  },
  inn: {
    padding: '100px 40px 40px',
  },
  avatar: {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    padding: 5,
    backgroundColor: '#fff',
    transform: 'translate(-50%, -50%)',
    left: '50%',
    top: 0,
  },

  forgot: {
    marginTop: 5,
  },

  forgot__link: {
    fontSize: 12,
    color: theme.palette.accent1Color,
    outlineColor: theme.palette.accent1Color,

    ':hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
});

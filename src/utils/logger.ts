// We can't predict all arguments so `any` here is pretty justified

// oxlint-disable
const log = (...args: Array<unknown>) => {
  console.log(
    "%c Chrono Deck %c",
    "background: #16a085; color: black;",
    "background: #1abc9c; color: black;",
    ...args,
  );
};

const debug = (...args: Array<unknown>) => {
  console.debug(
    "%c Chrono Deck %c",
    "background: #16a085; color: black;",
    "background: #1abc9c; color: black;",
    ...args,
  );
};

const error = (...args: Array<unknown>) => {
  console.error(
    "%c Chrono Deck %c",
    "background: #16a085; color: black;",
    "background: #FF0000;",
    ...args,
  );
};

const logger = {
  info: (...args: Array<unknown>) => {
    log(...args);
  },

  debug: (...args: Array<unknown>) => {
    debug(...args);
  },

  error: (...args: Array<unknown>) => {
    error(...args);
  },
};

export default logger;

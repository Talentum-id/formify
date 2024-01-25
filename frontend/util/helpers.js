export const getTaskStatus = (status) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'upcoming':
      return 'Upcomig';
    case 'overdue':
    case 'overdue_by_manager':
      return 'Overdue';
    case 'finished':
    case 'done':
      return 'Done';
    case 'waiting_for_review':
      return 'Pending';
    case 'on_revision':
      return 'On Revision';
    case 'in_progress':
      return 'In Progress';
    case 'returned':
      return 'Returned';

    default:
      return '';
  }
};

export function shortenAddress(address, chars = 4) {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

export function isMoreThan3Days(now) {
  const nowDate = new Date(now);

  const currentDate = new Date();

  const diffMs = currentDate.getTime() - nowDate.getTime();

  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays.toFixed(0) >= 3;
}

export function isLessThan3DaysLeft(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);

  const diffMs = target.getTime() - now.getTime();

  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays.toFixed(0) <= 3;
}

export function isLessThan3HoursLeft(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);

  const diffMs = target.getTime() - now.getTime();

  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours.toFixed(0) <= 3;
}

export function formatPastDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  const timeDiff = now.getTime() - date.getTime();

  if (timeDiff < 60 * 60 * 1000) {
    const minutesDiff = Math.round(timeDiff / (60 * 1000));
    return minutesDiff + ' m';
  }

  if (timeDiff < 24 * 60 * 60 * 1000) {
    const hoursDiff = Math.round(timeDiff / (60 * 60 * 1000));
    return hoursDiff + ' h';
  }

  if (timeDiff < 365 * 24 * 60 * 60 * 1000) {
    const daysDiff = Math.round(timeDiff / (24 * 60 * 60 * 1000));
    return daysDiff + ' d';
  }

  const yearsDiff = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000));
  const remainingDays = Math.floor(
    (timeDiff % (365 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000),
  );

  if (yearsDiff > 0) {
    return yearsDiff + ' y';
  }

  return remainingDays + ' d';
}

export const calculateTimeDifference = (time) => {
  const endTime = new Date(time * 1000);
  endTime.setHours(0, 0, 0, 0);

  const currentTime = new Date();

  const timezoneOffset = currentTime.getTimezoneOffset() * 60;

  let timeDifference = Math.floor((endTime - currentTime + timezoneOffset) / 1000);

  timeDifference = Math.max(timeDifference, 0);

  return {
    days: Math.floor(timeDifference / (24 * 60 * 60)),
    hours: Math.floor((timeDifference % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((timeDifference % (60 * 60)) / 60),
    seconds: timeDifference % 60,
  };
};

export function addDaysToDate(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);

  return date.toISOString();
}

export function formatFutureDate(dateStr) {
  const isValidDate = (date) => !isNaN(date.getTime());

  const date = new Date(dateStr);
  if (!isValidDate(date)) {
    return 'Invalid Date';
  }

  const now = new Date();

  if (date.getTime() < now.getTime()) {
    return '0 h';
  }

  const timeDiff = date.getTime() - now.getTime();

  if (timeDiff < 24 * 60 * 60 * 1000) {
    const hoursDiff = Math.round(timeDiff / (60 * 60 * 1000));
    return hoursDiff + ' h';
  }

  if (timeDiff < 30 * 24 * 60 * 60 * 1000) {
    const daysDiff = Math.round(timeDiff / (24 * 60 * 60 * 1000));
    return daysDiff + ' d';
  }

  if (timeDiff < 365 * 24 * 60 * 60 * 1000) {
    const monthsDiff = Math.round(timeDiff / (30 * 24 * 60 * 60 * 1000));
    return monthsDiff + ' m';
  }

  if (timeDiff >= 365 * 24 * 60 * 60 * 1000) {
    const yearsDiff = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000));
    return yearsDiff + ' y';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedDate = formatter.format(date);

  return formattedDate;
}

export function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  const formattedDate = new Date(date).toLocaleDateString('en-US', options);

  // Check if the date is from the current year
  const currentYear = new Date().getFullYear();
  const isCurrentYear = new Date(date).getFullYear() === currentYear;

  if (isCurrentYear) {
    // Return the formatted date without the year
    return formattedDate;
  } else {
    // Return the formatted date with the year
    return new Date(date).toLocaleDateString('en-US', { ...options, year: 'numeric' });
  }
}

export function formatDateMonthNameAndDay(value, year = false) {
  const date = new Date(value);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  if (year) {
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

export function formatNumber(num) {
  if (!num) return;
  if (num >= 10000) {
    const formattedNum = (num / 1000).toFixed(0);
    return formattedNum.replace(/\.0$/, '') + 'K';
  } else if (num >= 1000) {
    return num.toString().substr(0, 1) + ',' + num.toString().substr(1);
  } else if (Math.abs(num) < 0.001) {
    return 0;
  } else {
    return num.toString();
  }
}

export function formatNumberAddComma(num) {
  if (num >= 100000) {
    return num.toString().substr(0, 3) + ',' + num.toString().substr(3);
  } else if (num >= 10000) {
    return num.toString().substr(0, 2) + ',' + num.toString().substr(2);
  } else if (num >= 1000) {
    return num.toString().substr(0, 1) + ',' + num.toString().substr(1);
  } else {
    return num.toString();
  }
}

export function formatNumberMore10K(num) {
  if (num >= 10000) {
    const formattedNum = (num / 1000).toFixed(0);
    return formattedNum.replace(/\.0$/, '') + 'K';
  } else {
    return num.toString();
  }
}

export function reduceStringLength(str = '', maxLength, dots = true) {
  if (str) {
    if (str.toString().length <= maxLength) {
      return str;
    } else if (dots) {
      return str.slice(0, maxLength) + '...';
    } else {
      return str.slice(0, maxLength);
    }
  }
}

export function removeLineBreak(str) {
  if (str) {
    str = str.replaceAll('<p><br></p>', '');
  }
  return str;
}

export const getBadgeTypeByName = (name) => {
  switch (name) {
    case 'Social influence':
      return 'success';
    case 'Content making':
      return 'mint';
    case 'Design':
      return 'primary';
    case 'Copywriting':
      return 'info';
    case 'Testing':
      return 'warning';
    case 'Development':
      return 'danger';
    case 'All':
      return 'all';
    default:
      return 'success';
  }
};

export const getIconByName = (name) => {
  switch (name) {
    case 'projects':
      return 'Project';
    case 'talents':
      return 'Talents';
    case 'pending directions':
      return 'Direction';
    case 'pending claims':
      return 'Wallet';
    case 'managers':
      return 'Managers';
    case 'reviewed tasks':
    case 'completed':
      return 'Tik-Tik';
    case 'USDT earned':
      return 'Usdt';
    case 'overdue':
    case 'in progress':
    case 'overdue tasks':
      return 'Mark';
    case 'active talents':
      return 'Star-01';
    case 'created tasks':
      return 'Tasks';
    case 'joined projects':
      return 'Star-01';
    case 'on revision':
      return 'View';
    default:
      return '';
  }
};

export const getColorByClassName = (name) => {
  switch (name) {
    case 'success':
      return '#3ea33b';
    case 'mint':
      return '#25b8ae';
    case 'primary':
      return '#a94dd6';
    case 'warning':
      return '#a37800';
    case 'danger':
      return '#d64d69';
    case 'all':
      return '#AAA7CC';
    default:
      return '#3ea33b';
  }
};

export function checkIsPropertyExist(obj, prop) {
  if (obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  } else return false;
}

export function keyRandom() {
  return Math.floor(Math.random() * 10000) + Date.now();
}

export function modifyStringSpaces(inputStr) {
  let outputStr = inputStr.toLowerCase();
  outputStr = outputStr.replace(/\s+/g, '_');
  return outputStr;
}

export function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari');
}

export const isTaskHasList = (text) => {
  if (!text) return false;
  if (text.includes('<ul>') || text.includes('<ol>')) return true;
  else return false;
};

export function getCuttencyIcon(currency) {
  switch (currency) {
    case 'eth':
      return 'Ethereum-Circle';
    case 'bnb':
      return 'BNB-Circle';
    case 'btc':
      return 'Bitcoin-SV-Circle';
    case 'cplt':
      return 'USDT-Circle';
    case 'aave':
      return 'Aave-Circle';
    case 'discord':
      return 'Discord-Circle';
    default:
      return 'USDD-Default';
  }
}

export function dateToTimestamp(dateString) {
  const date = new Date(dateString);
  return date.getTime() / 1000;
}

export function timestampToString(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  const formattedString =
    year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  return formattedString;
}

export const isTaskHasLongWord = (text) => {
  if (!text) return false;
  const words = text.split(' ');
  let isActive = false;
  for (const word of words) {
    if (word.length > 75) {
      isActive = true;
    }
  }
  return isActive;
};

export function addLinksToText(text) {
  const linkRegex = /(<a[^>]*>.*?<\/a>|https?:\/\/[^\s<]+)/g;

  text = text.replace(linkRegex, (match) => {
    if (match.startsWith('<a')) {
      return match;
    }
    const checkedLink = match.replace(/<\/?p(?:\s+.*?)?>/g, '');
    return `<a href="${checkedLink}" class="task-link-wrapper" target="_blank">${checkedLink}</a>`;
  });

  text = text.replace(
    /<(ol|ul)([^>]*)>((?:.|\n)*?)<\/\1>/g,
    (match, tag, attributes, listContent) => {
      const updatedListContent = listContent.replace(/<li>(.*?)<\/li>/g, (liMatch, liContent) => {
        const checkedLink = liContent.replace(/<\/?p(?:\s+.*?)?>/g, '');
        if (checkedLink.match(linkRegex)) {
          return `<li>${addLinksToText(checkedLink)}</li>`;
        }
        return `<li>${checkedLink}</li>`;
      });
      return `<${tag} class="list-padding"${attributes}>${updatedListContent}</${tag}>`;
    },
  );

  return text;
}

export function transformDate(dateString) {
  const inputFormat =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

  if (!inputFormat.test(dateString)) {
    return dateString; // Return original string if it doesn't match the expected format
  }

  const today = new Date();

  const eventDate = new Date(dateString);
  const isToday = eventDate.getTime() === today.getTime();

  if (isToday) {
    return formatTransformDate(today);
  } else {
    return formatTransformDate(eventDate);
  }
}

function formatTransformDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDateCurrent(date) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(Number(date)).toLocaleDateString('en-US', options);
}

export const generateUint8Array = str => {
  const encoder = new TextEncoder('utf-8');
  const encodedString = encoder.encode(str);

  const uint8Array = new Uint8Array(32);

  uint8Array.set(encodedString.slice(0, 32));

  return uint8Array;
};
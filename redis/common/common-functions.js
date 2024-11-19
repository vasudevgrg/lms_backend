exports.isUUID=(str)=> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

exports.removeUuidsFromResponse = (data) => {

}

exports.removeUuid=(data)=> {

    if(typeof data == "object") {
      for(let key in data) {
        if(this.isUUID(data[key]) && key != 'uuid' && key != 'user_id' ) {
          delete data[key];
        }
      }
    }
    return data;
}

exports.extractUUIDs=(str)=> {
    const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g;
    const matches = str.match(uuidRegex);
    return matches || []; // Return the array of matches, or an empty array if none are found
  }

  exports.convertToRedisKey = (url) => {
    const arr = url.split("?");
    const path = arr[0];

    const segments = path.split('/').filter(Boolean);
    if (segments.length === 1) {
        if (arr.length > 1) {
            return `${segments[0]}:${arr[1]}`;
        } else {
            return segments[0];
        }
    } else if (segments.length == 2) {
        if (arr.length > 1) {
            return `${segments[1]}:${arr[1]}`;
        } else {
            return segments[1];
        }
    } else if (segments.length == 3) {
        if (arr.length > 1) {
          console.log('arr[1]: ', arr[1]);
            return `${segments[1]}:${segments[2]}:${arr[1]}`;
        } else {
            return `${segments[1]}:${segments[2]}`;
        }
    } else if (segments.length == 4) {
        if (arr.length > 1) {
            return `${segments[3]}:${arr[1]}`;
        } else {
            return segments[3];
        }
    } else {
        return segments.join(":");
    }
}

export function renameTypeKeyConditionally(obj) 
{
  function containsLinkMark(node) {
  if (!node.content || !Array.isArray(node.content)) return false;

  return node.content.some(item => {
    if (!item.marks) return false;
    return item.marks.some(mark => mark.type === 'link');
  });
}

  {/* Read the Array Taken from the Argument in the Passed Function*/}
  if (Array.isArray(obj)) 
  {
    return obj.map(renameTypeKeyConditionally);  // Recursively Read all the Items in the Array
  } 
  
  else if (obj !== null && typeof obj === 'object') 
  {
    const newObj = {};                           // Create a Constant to Store the Transformed Key 
    for (const key in obj)                       // Read all the Keys in the Entire Object
    {
      const value = obj[key];                    // Find the Value of the Key

      if (key === 'type')                        // Since every Keys are named "type", it will find everything of these
      {
        switch (value)                           // This Checks the Value of the Key
        {
        case 'paragraph':
          if (containsLinkMark(obj)) {
            newObj['linkType'] = 'link';
          } else {
            newObj['textType'] = value;
          }
          break;
          case 'heading':
            newObj['headerBlock'] = value;
            break;
          case 'youtube':
            newObj['videoBlock'] = value;
            break;
          case 'bulletList':
            newObj['bulletListBlock'] = value;
            break;
          case 'orderedList':
            newObj['orderListBlock'] = value;
            break;
          case 'blockquote':
            newObj['blockQuoteBlock'] = value;
            break;
          case 'image':
            newObj['imageBlock'] = value;
            break;

          default:
            newObj[key] = value;
            break;
        }
      } 
      else 
      {
        newObj[key] = renameTypeKeyConditionally(value);
      }
    }
    return newObj;
  }
  return obj;
}

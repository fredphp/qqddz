package com.sun.activation.registries;

public class MailcapTokenizer
{
  public static final int EOI_TOKEN = 5;
  public static final int EQUALS_TOKEN = 61;
  public static final int SEMICOLON_TOKEN = 59;
  public static final int SLASH_TOKEN = 47;
  public static final int START_TOKEN = 1;
  public static final int STRING_TOKEN = 2;
  public static final int UNKNOWN_TOKEN;
  private char autoquoteChar;
  private int currentToken;
  private String currentTokenValue;
  private String data;
  private int dataIndex;
  private int dataLength;
  private boolean isAutoquoting;

  public MailcapTokenizer(String paramString)
  {
    this.data = paramString;
    this.dataIndex = 0;
    this.dataLength = paramString.length();
    this.currentToken = 1;
    this.currentTokenValue = "";
    this.isAutoquoting = false;
    this.autoquoteChar = ';';
  }

  private static String fixEscapeSequences(String paramString)
  {
    int i = paramString.length();
    StringBuffer localStringBuffer = new StringBuffer();
    localStringBuffer.ensureCapacity(i);
    int j = 0;
    if (j >= i)
      return localStringBuffer.toString();
    char c = paramString.charAt(j);
    if (c != '\\')
      localStringBuffer.append(c);
    while (true)
    {
      j++;
      break;
      if (j < i - 1)
      {
        localStringBuffer.append(paramString.charAt(j + 1));
        j++;
      }
      else
      {
        localStringBuffer.append(c);
      }
    }
  }

  private static boolean isControlChar(char paramChar)
  {
    return Character.isISOControl(paramChar);
  }

  private static boolean isSpecialChar(char paramChar)
  {
    switch (paramChar)
    {
    default:
      return false;
    case '"':
    case '(':
    case ')':
    case ',':
    case '/':
    case ':':
    case ';':
    case '<':
    case '=':
    case '>':
    case '?':
    case '@':
    case '[':
    case '\\':
    case ']':
    }
    return true;
  }

  private static boolean isStringTokenChar(char paramChar)
  {
    return (!isSpecialChar(paramChar)) && (!isControlChar(paramChar)) && (!isWhiteSpaceChar(paramChar));
  }

  private static boolean isWhiteSpaceChar(char paramChar)
  {
    return Character.isWhitespace(paramChar);
  }

  public static String nameForToken(int paramInt)
  {
    switch (paramInt)
    {
    default:
      return "really unknown";
    case 0:
      return "unknown";
    case 1:
      return "start";
    case 2:
      return "string";
    case 5:
      return "EOI";
    case 47:
      return "'/'";
    case 59:
      return "';'";
    case 61:
    }
    return "'='";
  }

  private void processAutoquoteToken()
  {
    int i = this.dataIndex;
    int j = 0;
    while (true)
    {
      if ((this.dataIndex >= this.dataLength) || (j != 0))
      {
        this.currentToken = 2;
        this.currentTokenValue = fixEscapeSequences(this.data.substring(i, this.dataIndex));
        return;
      }
      if (this.data.charAt(this.dataIndex) != this.autoquoteChar)
        this.dataIndex = (1 + this.dataIndex);
      else
        j = 1;
    }
  }

  private void processStringToken()
  {
    int i = this.dataIndex;
    while (true)
    {
      if ((this.dataIndex >= this.dataLength) || (!isStringTokenChar(this.data.charAt(this.dataIndex))))
      {
        this.currentToken = 2;
        this.currentTokenValue = this.data.substring(i, this.dataIndex);
        return;
      }
      this.dataIndex = (1 + this.dataIndex);
    }
  }

  public int getCurrentToken()
  {
    return this.currentToken;
  }

  public String getCurrentTokenValue()
  {
    return this.currentTokenValue;
  }

  public int nextToken()
  {
    char c;
    if (this.dataIndex < this.dataLength)
      if ((this.dataIndex >= this.dataLength) || (!isWhiteSpaceChar(this.data.charAt(this.dataIndex))))
      {
        if (this.dataIndex >= this.dataLength)
          break label234;
        c = this.data.charAt(this.dataIndex);
        if (!this.isAutoquoting)
          break label136;
        if ((c != ';') && (c != '='))
          break label129;
        this.currentToken = c;
        this.currentTokenValue = new Character(c).toString();
        this.dataIndex = (1 + this.dataIndex);
      }
    while (true)
    {
      return this.currentToken;
      this.dataIndex = (1 + this.dataIndex);
      break;
      label129: processAutoquoteToken();
      continue;
      label136: if (isStringTokenChar(c))
      {
        processStringToken();
      }
      else if ((c == '/') || (c == ';') || (c == '='))
      {
        this.currentToken = c;
        this.currentTokenValue = new Character(c).toString();
        this.dataIndex = (1 + this.dataIndex);
      }
      else
      {
        this.currentToken = 0;
        this.currentTokenValue = new Character(c).toString();
        this.dataIndex = (1 + this.dataIndex);
        continue;
        label234: this.currentToken = 5;
        this.currentTokenValue = null;
        continue;
        this.currentToken = 5;
        this.currentTokenValue = null;
      }
    }
  }

  public void setIsAutoquoting(boolean paramBoolean)
  {
    this.isAutoquoting = paramBoolean;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.activation.registries.MailcapTokenizer
 * JD-Core Version:    0.6.2
 */
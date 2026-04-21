package javax.mail.internet;

public class HeaderTokenizer
{
  private static final Token EOFToken = new Token(-4, null);
  public static final String MIME = "()<>@,;:\\\"\t []/?=";
  public static final String RFC822 = "()<>@,;:\\\"\t .[]";
  private int currentPos;
  private String delimiters;
  private int maxPos;
  private int nextPos;
  private int peekPos;
  private boolean skipComments;
  private String string;

  public HeaderTokenizer(String paramString)
  {
    this(paramString, "()<>@,;:\\\"\t .[]");
  }

  public HeaderTokenizer(String paramString1, String paramString2)
  {
    this(paramString1, paramString2, true);
  }

  public HeaderTokenizer(String paramString1, String paramString2, boolean paramBoolean)
  {
    if (paramString1 == null)
      paramString1 = "";
    this.string = paramString1;
    this.skipComments = paramBoolean;
    this.delimiters = paramString2;
    this.peekPos = 0;
    this.nextPos = 0;
    this.currentPos = 0;
    this.maxPos = this.string.length();
  }

  private static String filterToken(String paramString, int paramInt1, int paramInt2)
  {
    StringBuffer localStringBuffer = new StringBuffer();
    int i = 0;
    int j = 0;
    int k = paramInt1;
    if (k >= paramInt2)
      return localStringBuffer.toString();
    char c = paramString.charAt(k);
    if ((c == '\n') && (j != 0))
      j = 0;
    while (true)
    {
      k++;
      break;
      if (i == 0)
      {
        if (c == '\\')
        {
          i = 1;
          j = 0;
        }
        else if (c == '\r')
        {
          j = 1;
        }
        else
        {
          localStringBuffer.append(c);
          j = 0;
        }
      }
      else
      {
        localStringBuffer.append(c);
        j = 0;
        i = 0;
      }
    }
  }

  private Token getNext()
    throws ParseException
  {
    if (this.currentPos >= this.maxPos)
      return EOFToken;
    if (skipWhiteSpace() == -4)
      return EOFToken;
    int i = 0;
    int i3;
    for (int j = this.string.charAt(this.currentPos); ; j = this.string.charAt(this.currentPos))
    {
      if (j != 40)
      {
        if (j != 34)
          break label431;
        i3 = 1 + this.currentPos;
        this.currentPos = i3;
        if (this.currentPos < this.maxPos)
          break;
        throw new ParseException("Unbalanced quoted string");
      }
      int k = 1 + this.currentPos;
      this.currentPos = k;
      int m = 1;
      if ((m <= 0) || (this.currentPos >= this.maxPos))
      {
        if (m != 0)
          throw new ParseException("Unbalanced comments");
      }
      else
      {
        int n = this.string.charAt(this.currentPos);
        if (n == 92)
        {
          this.currentPos = (1 + this.currentPos);
          i = 1;
        }
        while (true)
        {
          this.currentPos = (1 + this.currentPos);
          break;
          if (n == 13)
            i = 1;
          else if (n == 40)
            m++;
          else if (n == 41)
            m--;
        }
      }
      if (!this.skipComments)
      {
        if (i != 0);
        for (String str1 = filterToken(this.string, k, -1 + this.currentPos); ; str1 = this.string.substring(k, -1 + this.currentPos))
          return new Token(-3, str1);
      }
      if (skipWhiteSpace() == -4)
        return EOFToken;
    }
    int i4 = this.string.charAt(this.currentPos);
    if (i4 == 92)
    {
      this.currentPos = (1 + this.currentPos);
      i = 1;
    }
    label361: 
    do
      while (true)
      {
        this.currentPos = (1 + this.currentPos);
        break;
        if (i4 != 13)
          break label361;
        i = 1;
      }
    while (i4 != 34);
    this.currentPos = (1 + this.currentPos);
    if (i != 0);
    for (String str2 = filterToken(this.string, i3, -1 + this.currentPos); ; str2 = this.string.substring(i3, -1 + this.currentPos))
      return new Token(-2, str2);
    label431: if ((j < 32) || (j >= 127) || (this.delimiters.indexOf(j) >= 0))
    {
      this.currentPos = (1 + this.currentPos);
      return new Token(j, new String(new char[] { j }));
    }
    int i1 = this.currentPos;
    while (true)
    {
      if (this.currentPos >= this.maxPos);
      int i2;
      do
      {
        return new Token(-1, this.string.substring(i1, this.currentPos));
        i2 = this.string.charAt(this.currentPos);
      }
      while ((i2 < 32) || (i2 >= 127) || (i2 == 40) || (i2 == 32) || (i2 == 34) || (this.delimiters.indexOf(i2) >= 0));
      this.currentPos = (1 + this.currentPos);
    }
  }

  private int skipWhiteSpace()
  {
    while (true)
    {
      if (this.currentPos >= this.maxPos)
        return -4;
      int i = this.string.charAt(this.currentPos);
      if ((i != 32) && (i != 9) && (i != 13) && (i != 10))
        return this.currentPos;
      this.currentPos = (1 + this.currentPos);
    }
  }

  public String getRemainder()
  {
    return this.string.substring(this.nextPos);
  }

  public Token next()
    throws ParseException
  {
    this.currentPos = this.nextPos;
    Token localToken = getNext();
    int i = this.currentPos;
    this.peekPos = i;
    this.nextPos = i;
    return localToken;
  }

  public Token peek()
    throws ParseException
  {
    this.currentPos = this.peekPos;
    Token localToken = getNext();
    this.peekPos = this.currentPos;
    return localToken;
  }

  public static class Token
  {
    public static final int ATOM = -1;
    public static final int COMMENT = -3;
    public static final int EOF = -4;
    public static final int QUOTEDSTRING = -2;
    private int type;
    private String value;

    public Token(int paramInt, String paramString)
    {
      this.type = paramInt;
      this.value = paramString;
    }

    public int getType()
    {
      return this.type;
    }

    public String getValue()
    {
      return this.value;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.HeaderTokenizer
 * JD-Core Version:    0.6.2
 */
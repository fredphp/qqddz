package com.sun.activation.registries;

import java.util.NoSuchElementException;
import java.util.Vector;

class LineTokenizer
{
  private static final String singles = "=";
  private int currentPosition = 0;
  private int maxPosition;
  private Vector stack = new Vector();
  private String str;

  public LineTokenizer(String paramString)
  {
    this.str = paramString;
    this.maxPosition = paramString.length();
  }

  private void skipWhiteSpace()
  {
    while (true)
    {
      if ((this.currentPosition >= this.maxPosition) || (!Character.isWhitespace(this.str.charAt(this.currentPosition))))
        return;
      this.currentPosition = (1 + this.currentPosition);
    }
  }

  public boolean hasMoreTokens()
  {
    if (this.stack.size() > 0);
    do
    {
      return true;
      skipWhiteSpace();
    }
    while (this.currentPosition < this.maxPosition);
    return false;
  }

  public String nextToken()
  {
    int i = this.stack.size();
    if (i > 0)
    {
      String str3 = (String)this.stack.elementAt(i - 1);
      this.stack.removeElementAt(i - 1);
      return str3;
    }
    skipWhiteSpace();
    if (this.currentPosition >= this.maxPosition)
      throw new NoSuchElementException();
    int j = this.currentPosition;
    int k = this.str.charAt(j);
    int m;
    if (k == 34)
    {
      this.currentPosition = (1 + this.currentPosition);
      m = 0;
      if (this.currentPosition < this.maxPosition);
    }
    while (true)
    {
      return this.str.substring(j, this.currentPosition);
      String str1 = this.str;
      int n = this.currentPosition;
      this.currentPosition = (n + 1);
      int i1 = str1.charAt(n);
      if (i1 == 92)
      {
        this.currentPosition = (1 + this.currentPosition);
        m = 1;
        break;
      }
      if (i1 != 34)
        break;
      StringBuffer localStringBuffer;
      int i2;
      if (m != 0)
      {
        localStringBuffer = new StringBuffer();
        i2 = j + 1;
        if (i2 < -1 + this.currentPosition);
      }
      for (String str2 = localStringBuffer.toString(); ; str2 = this.str.substring(j + 1, -1 + this.currentPosition))
      {
        return str2;
        char c = this.str.charAt(i2);
        if (c != '\\')
          localStringBuffer.append(c);
        i2++;
        break;
      }
      if ("=".indexOf(k) >= 0)
        this.currentPosition = (1 + this.currentPosition);
      else
        do
        {
          this.currentPosition = (1 + this.currentPosition);
          if ((this.currentPosition >= this.maxPosition) || ("=".indexOf(this.str.charAt(this.currentPosition)) >= 0))
            break;
        }
        while (!Character.isWhitespace(this.str.charAt(this.currentPosition)));
    }
  }

  public void pushToken(String paramString)
  {
    this.stack.addElement(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.activation.registries.LineTokenizer
 * JD-Core Version:    0.6.2
 */
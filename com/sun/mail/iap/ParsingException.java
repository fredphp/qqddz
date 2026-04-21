package com.sun.mail.iap;

public class ParsingException extends ProtocolException
{
  private static final long serialVersionUID = 7756119840142724839L;

  public ParsingException()
  {
  }

  public ParsingException(Response paramResponse)
  {
    super(paramResponse);
  }

  public ParsingException(String paramString)
  {
    super(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.ParsingException
 * JD-Core Version:    0.6.2
 */
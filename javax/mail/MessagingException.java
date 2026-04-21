package javax.mail;

public class MessagingException extends Exception
{
  private static final long serialVersionUID = -7569192289819959253L;
  private Exception next;

  public MessagingException()
  {
    initCause(null);
  }

  public MessagingException(String paramString)
  {
    super(paramString);
    initCause(null);
  }

  public MessagingException(String paramString, Exception paramException)
  {
    super(paramString);
    this.next = paramException;
    initCause(null);
  }

  private final String superToString()
  {
    return super.toString();
  }

  public Throwable getCause()
  {
    try
    {
      Exception localException = this.next;
      return localException;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public Exception getNextException()
  {
    try
    {
      Exception localException = this.next;
      return localException;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public boolean setNextException(Exception paramException)
  {
    Object localObject1 = this;
    try
    {
      if ((!(localObject1 instanceof MessagingException)) || (((MessagingException)localObject1).next == null))
      {
        if (!(localObject1 instanceof MessagingException))
          break label55;
        ((MessagingException)localObject1).next = paramException;
      }
      label55: for (boolean bool = true; ; bool = false)
      {
        return bool;
        localObject1 = ((MessagingException)localObject1).next;
        break;
      }
    }
    finally
    {
    }
  }

  public String toString()
  {
    try
    {
      String str = super.toString();
      Exception localException = this.next;
      if (localException == null)
        return str;
      if (str == null)
        str = "";
      StringBuffer localStringBuffer = new StringBuffer(str);
      while (true)
      {
        if (localException == null)
        {
          str = localStringBuffer.toString();
          break;
        }
        localStringBuffer.append(";\n  nested exception is:\n\t");
        if ((localException instanceof MessagingException))
        {
          MessagingException localMessagingException = (MessagingException)localException;
          localStringBuffer.append(localMessagingException.superToString());
          localException = localMessagingException.next;
        }
        else
        {
          localStringBuffer.append(localException.toString());
          localException = null;
        }
      }
    }
    finally
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.MessagingException
 * JD-Core Version:    0.6.2
 */
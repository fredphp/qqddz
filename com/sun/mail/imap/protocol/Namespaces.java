package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import java.util.Vector;

public class Namespaces
{
  public Namespace[] otherUsers = getNamespaces(paramResponse);
  public Namespace[] personal = getNamespaces(paramResponse);
  public Namespace[] shared = getNamespaces(paramResponse);

  public Namespaces(Response paramResponse)
    throws ProtocolException
  {
  }

  private Namespace[] getNamespaces(Response paramResponse)
    throws ProtocolException
  {
    paramResponse.skipSpaces();
    if (paramResponse.peekByte() == 40)
    {
      Vector localVector = new Vector();
      paramResponse.readByte();
      do
        localVector.addElement(new Namespace(paramResponse));
      while (paramResponse.peekByte() != 41);
      paramResponse.readByte();
      Namespace[] arrayOfNamespace = new Namespace[localVector.size()];
      localVector.copyInto(arrayOfNamespace);
      return arrayOfNamespace;
    }
    String str = paramResponse.readAtom();
    if (str == null)
      throw new ProtocolException("Expected NIL, got null");
    if (!str.equalsIgnoreCase("NIL"))
      throw new ProtocolException("Expected NIL, got " + str);
    return null;
  }

  public static class Namespace
  {
    public char delimiter;
    public String prefix;

    public Namespace(Response paramResponse)
      throws ProtocolException
    {
      if (paramResponse.readByte() != 40)
        throw new ProtocolException("Missing '(' at start of Namespace");
      this.prefix = BASE64MailboxDecoder.decode(paramResponse.readString());
      paramResponse.skipSpaces();
      if (paramResponse.peekByte() == 34)
      {
        paramResponse.readByte();
        this.delimiter = ((char)paramResponse.readByte());
        if (this.delimiter == '\\')
          this.delimiter = ((char)paramResponse.readByte());
        if (paramResponse.readByte() != 34)
          throw new ProtocolException("Missing '\"' at end of QUOTED_CHAR");
      }
      else
      {
        String str = paramResponse.readAtom();
        if (str == null)
          throw new ProtocolException("Expected NIL, got null");
        if (!str.equalsIgnoreCase("NIL"))
          throw new ProtocolException("Expected NIL, got " + str);
        this.delimiter = '\000';
      }
      if (paramResponse.peekByte() != 41)
      {
        paramResponse.skipSpaces();
        paramResponse.readString();
        paramResponse.skipSpaces();
        paramResponse.readStringList();
      }
      if (paramResponse.readByte() != 41)
        throw new ProtocolException("Missing ')' at end of Namespace");
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.Namespaces
 * JD-Core Version:    0.6.2
 */
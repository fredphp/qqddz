package javax.activation;

import java.io.IOException;

public abstract interface CommandObject
{
  public abstract void setCommandContext(String paramString, DataHandler paramDataHandler)
    throws IOException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.CommandObject
 * JD-Core Version:    0.6.2
 */
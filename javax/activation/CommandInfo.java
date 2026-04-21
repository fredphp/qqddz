package javax.activation;

import java.beans.Beans;
import java.io.Externalizable;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;

public class CommandInfo
{
  private String className;
  private String verb;

  public CommandInfo(String paramString1, String paramString2)
  {
    this.verb = paramString1;
    this.className = paramString2;
  }

  public String getCommandClass()
  {
    return this.className;
  }

  public String getCommandName()
  {
    return this.verb;
  }

  public Object getCommandObject(DataHandler paramDataHandler, ClassLoader paramClassLoader)
    throws IOException, ClassNotFoundException
  {
    Object localObject = Beans.instantiate(paramClassLoader, this.className);
    if (localObject != null)
    {
      if (!(localObject instanceof CommandObject))
        break label36;
      ((CommandObject)localObject).setCommandContext(this.verb, paramDataHandler);
    }
    label36: InputStream localInputStream;
    do
    {
      do
        return localObject;
      while ((!(localObject instanceof Externalizable)) || (paramDataHandler == null));
      localInputStream = paramDataHandler.getInputStream();
    }
    while (localInputStream == null);
    ((Externalizable)localObject).readExternal(new ObjectInputStream(localInputStream));
    return localObject;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.CommandInfo
 * JD-Core Version:    0.6.2
 */
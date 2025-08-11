import { trpc } from "../trpc";

const Hello = () => {
    const { data } = trpc.hello.useQuery();

    return <p>{data}</p>;
};
export default Hello;
